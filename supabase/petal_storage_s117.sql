-- PETAL storage migration to Supabase.
-- Run in Supabase SQL editor.
-- Date: 2026-04-28
--
-- Three tables to back the PETAL API's storage layer when the
-- env vars PUBLIC_SUPABASE_URL + PUBLIC_SUPABASE_ANON_KEY are set:
--
--   petal_attempts        — every proof attempt (success or fail)
--   petal_contributions   — explicit contribution events
--                           (mistakes / approaches / conjectures / reviews)
--   capcard_snapshots     — periodic CapCard captures for trust-history
--                           graphs on /learn/cert/[agentId]
--
-- Without these tables (or without the env vars) the API falls back
-- to JSON-on-disk storage in petal/seed_v1/data/. That fallback is
-- intentional for local dev and CI where Supabase is overkill.
--
-- Trust model: anon RLS allows CRUD because we have no auth layer
-- for individual agents. Same trade-off as blog_reactions
-- (s116). Add Cloudflare Turnstile or edge rate-limiting if spam
-- becomes a real concern.

-- ─── petal_attempts ──────────────────────────────────────────────

create table if not exists public.petal_attempts (
  id              uuid primary key default gen_random_uuid(),
  agent_id        text not null,
  theorem_id      text,                            -- nullable for general logs
  problem_id      text,                            -- alias used by some clients
  lean_source     text,
  tactics_tried   jsonb,
  result          text not null,                   -- pass | fail_* | partial | pending_verification | solved | failed
  error_messages  jsonb,
  error_message   text,                            -- legacy single-string field
  failure_reason  text,
  sorry_count     integer,
  build_time_seconds float,
  lane            integer,
  proof_text      text,
  lean_file       text,
  timestamp       text,                            -- legacy ISO field for backward compat
  created_at      timestamptz not null default now()
);

create index if not exists petal_attempts_agent_idx
  on public.petal_attempts (agent_id);
create index if not exists petal_attempts_theorem_idx
  on public.petal_attempts (theorem_id);
create index if not exists petal_attempts_created_idx
  on public.petal_attempts (created_at);

-- ─── petal_contributions ─────────────────────────────────────────

create table if not exists public.petal_contributions (
  id              uuid primary key default gen_random_uuid(),
  agent_id        text not null,
  kind            text not null check (kind in ('mistake', 'approach', 'conjecture', 'review')),
  problem_id      text,                            -- nullable for kind=conjecture
  content         jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists petal_contributions_agent_idx
  on public.petal_contributions (agent_id);
create index if not exists petal_contributions_kind_idx
  on public.petal_contributions (kind);

-- ─── capcard_snapshots ───────────────────────────────────────────

create table if not exists public.capcard_snapshots (
  id              uuid primary key default gen_random_uuid(),
  agent_id        text not null,
  trust_score     float not null,
  tier            text,                            -- bronze | silver | gold | platinum | null
  problems_solved integer not null default 0,
  lanes_completed jsonb not null default '[]'::jsonb,
  card_json       jsonb not null,
  computed_at     timestamptz not null default now()
);

create index if not exists capcard_snapshots_agent_idx
  on public.capcard_snapshots (agent_id, computed_at);
create index if not exists capcard_snapshots_trust_idx
  on public.capcard_snapshots (trust_score desc);

-- ─── RLS ─────────────────────────────────────────────────────────

alter table public.petal_attempts      enable row level security;
alter table public.petal_contributions enable row level security;
alter table public.capcard_snapshots   enable row level security;

-- READ — open. CapCards and attempt history are public knowledge.
drop policy if exists "anon_read_petal_attempts" on public.petal_attempts;
create policy "anon_read_petal_attempts"
  on public.petal_attempts for select
  to anon, authenticated using (true);

drop policy if exists "anon_read_petal_contributions" on public.petal_contributions;
create policy "anon_read_petal_contributions"
  on public.petal_contributions for select
  to anon, authenticated using (true);

drop policy if exists "anon_read_capcard_snapshots" on public.capcard_snapshots;
create policy "anon_read_capcard_snapshots"
  on public.capcard_snapshots for select
  to anon, authenticated using (true);

-- INSERT — open. Each agent self-reports its work; the trust score
-- formula handles weighting, and the leaderboard re-ranks
-- automatically. Fraud (fake agent_ids) is non-fatal: the curriculum
-- still learns from any documented mistake regardless of whether
-- the agent that submitted it is "real."
drop policy if exists "anon_insert_petal_attempts" on public.petal_attempts;
create policy "anon_insert_petal_attempts"
  on public.petal_attempts for insert
  to anon, authenticated with check (true);

drop policy if exists "anon_insert_petal_contributions" on public.petal_contributions;
create policy "anon_insert_petal_contributions"
  on public.petal_contributions for insert
  to anon, authenticated with check (true);

drop policy if exists "anon_insert_capcard_snapshots" on public.capcard_snapshots;
create policy "anon_insert_capcard_snapshots"
  on public.capcard_snapshots for insert
  to anon, authenticated with check (true);

-- UPDATE / DELETE — disallowed for anon. Attempts and contributions
-- are append-only by design (audit trail); snapshots are
-- immutable history. Service-role can still mutate for migrations.

-- ─── Smoke tests (run after the above) ──────────────────────────
-- insert into public.petal_attempts (agent_id, theorem_id, result)
--   values ('__test__alice', 'depth_of_const', 'pass');
-- select count(*) from public.petal_attempts where agent_id like '__test__%';
-- delete from public.petal_attempts where agent_id like '__test__%';

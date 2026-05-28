import type { Metadata } from "next";
import { C, pill } from "../../evidence/data";
import searchJson from "./data/eml_symbolic_regression_template_search_2026_05_27.json";

type TemplateResult = {
  id: string;
  family: string;
  grammarOperatorNodes: number;
  freeParameterCount: number;
  description: string;
  bestGamma: number | null;
  bestMse: number;
  errorFromFirstKnownZero: number | null;
  complexityAdjustedScore: number;
  status: string;
};

const search = searchJson as unknown as {
  status: string;
  searchId: string;
  fixture: {
    sampleCount: number;
    xMin: number;
    xMax: number;
    primeCountUpToMax: number;
  };
  scan: {
    knownFirstZetaZeroGamma: number;
    gammaMin: number;
    gammaMax: number;
    gammaSteps: number;
  };
  templates: TemplateResult[];
  rankings: {
    byMse: string[];
    byLocalization: string[];
    byComplexityAdjustedScore: string[];
    byCandidateComplexityAdjustedScore: string[];
  };
  interpretation: {
    resultLabel: string;
    fullPysrRunPerformed: boolean;
    reviewFinding: string;
    summary: string;
  };
  nonClaims: string[];
};

export const metadata: Metadata = {
  title: "EML Template Search",
  description: "Candidate-only fixed-template search for EML symbolic-regression research.",
};

function fmt(value: number | null, digits = 6) {
  return value === null ? "n/a" : value.toFixed(digits);
}

function familyColor(value: string) {
  if (value === "eml") return C.green;
  if (value === "standard") return C.blue;
  if (value === "baseline") return C.purple;
  return C.orange;
}

function Metric({ label, value, color = C.orange }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 14, minHeight: 78 }}>
      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.4 }}>{label}</div>
      <div style={{ color, fontSize: 22, fontWeight: 800, fontFamily: "monospace", marginTop: 8 }}>{value}</div>
    </div>
  );
}

export default function EmlSymbolicRegressionPage() {
  const eml = search.templates.find((item) => item.id === "eml_critical_one_node");
  const standard = search.templates.find((item) => item.id === "standard_profiled_sqrt_cos_sin");
  const wrong = search.templates.find((item) => item.id === "eml_wrong_exponent_03");

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 18px 72px" }}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28, fontSize: 12 }}>
          <a href="/" style={{ color: C.muted, textDecoration: "none" }}>monogate.dev</a>
          <a href="/explorer" style={{ color: C.muted, textDecoration: "none" }}>Explorer</a>
          <a href="/explorer/eml-atlas-annex" style={{ color: C.muted, textDecoration: "none" }}>Atlas Annex</a>
          <a href="/explorer/eml-prime-residual" style={{ color: C.muted, textDecoration: "none" }}>Prime Residual</a>
          <a href="/explorer/eml-advantage" style={{ color: C.muted, textDecoration: "none" }}>Advantage Lab</a>
          <a href="/explorer/eml-language" style={{ color: C.muted, textDecoration: "none" }}>EML Language</a>
        </nav>

        <header style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {pill("EML-A5", C.orange)}
            {pill(search.status, C.green)}
            {pill("fixed-template search", C.blue)}
            {pill("full PySR: false", C.green)}
          </div>
          <h1 style={{ color: C.orange, fontSize: 34, lineHeight: 1.1, margin: "0 0 12px", fontFamily: "monospace" }}>
            EML Symbolic-Regression Template Search
          </h1>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, maxWidth: 860, margin: 0 }}>
            A candidate-only scan over fixed EML, standard, control, and baseline templates for the same Chebyshev psi residual fixture.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 24 }}>
          <Metric label="Templates" value={search.templates.length} color={C.blue} />
          <Metric label="Samples" value={search.fixture.sampleCount} color={C.purple} />
          <Metric label="Gamma scan" value={`${search.scan.gammaMin}-${search.scan.gammaMax}`} color={C.orange} />
          <Metric label="Known gamma1" value={fmt(search.scan.knownFirstZetaZeroGamma)} color={C.green} />
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            review finding
          </div>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>
            {search.interpretation.summary}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {pill(search.interpretation.reviewFinding, C.orange)}
            {pill(`candidate score leader: ${search.rankings.byCandidateComplexityAdjustedScore[0]}`, C.green)}
            {pill(`localization leader: ${search.rankings.byLocalization[0]}`, C.purple)}
            {pill(`MSE leader: ${search.rankings.byMse[0]}`, C.blue)}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12, marginBottom: 24 }}>
          {eml && <Metric label="EML gamma error" value={fmt(eml.errorFromFirstKnownZero)} color={C.green} />}
          {standard && <Metric label="Standard gamma error" value={fmt(standard.errorFromFirstKnownZero)} color={C.blue} />}
          {wrong && <Metric label="Wrong-exponent gamma error" value={fmt(wrong.errorFromFirstKnownZero)} color={C.orange} />}
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            templates
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860, fontSize: 12 }}>
              <thead>
                <tr style={{ color: C.muted, textAlign: "left" }}>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Template</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Family</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Nodes</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Params</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Gamma</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>MSE</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Gamma error</th>
                </tr>
              </thead>
              <tbody>
                {search.templates.map((template) => (
                  <tr key={template.id}>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace", overflowWrap: "anywhere" }}>{template.id}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px" }}>{pill(template.family, familyColor(template.family))}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{template.grammarOperatorNodes}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{template.freeParameterCount}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{fmt(template.bestGamma)}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{fmt(template.bestMse)}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{fmt(template.errorFromFirstKnownZero)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            non-claims
          </div>
          <ul style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>
            {search.nonClaims.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

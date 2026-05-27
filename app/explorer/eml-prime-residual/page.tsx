import type { Metadata } from "next";
import { C, pill } from "../../evidence/data";
import benchmarkJson from "./data/eml_prime_residual_benchmark_2026_05_27.json";

type ModelResult = {
  model: string;
  grammarOperatorNodes: number;
  freeParameterCount: number;
  bestGamma: number;
  bestMse: number;
  errorFromFirstKnownZero: number;
};

const benchmark = benchmarkJson as unknown as {
  status: string;
  benchmarkId: string;
  fixture: {
    sampleCount: number;
    xMin: number;
    xMax: number;
    primeCountUpToMax: number;
    residualMseAgainstZero: number;
  };
  scan: {
    knownFirstZetaZeroGamma: number;
    eml: ModelResult;
    standard: ModelResult & { profiledCoefficients: number[] };
    comparison: {
      emlCloserToFirstKnownZero: boolean;
      standardLowerMse: boolean;
      mseGapStandardMinusEml: number;
      complexityRatioStandardToEml: number;
    };
  };
  negativeControls: Array<{
    label: string;
    status: string;
    emlBestGamma: number;
    standardBestGamma: number;
    nonClaim: string;
  }>;
  interpretation: {
    resultLabel: string;
    nullResultAcceptable: boolean;
    summary: string;
  };
  nonClaims: string[];
};

export const metadata: Metadata = {
  title: "EML Prime Residual Benchmark",
  description: "Candidate-only EML grammar benchmark over a fixed Chebyshev psi residual fixture.",
};

function Metric({ label, value, color = C.orange }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 14, minHeight: 78 }}>
      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.4 }}>{label}</div>
      <div style={{ color, fontSize: 22, fontWeight: 800, fontFamily: "monospace", marginTop: 8 }}>{value}</div>
    </div>
  );
}

function fmt(value: number, digits = 6) {
  return value.toFixed(digits);
}

function ModelCard({ title, model, color }: { title: string; model: ModelResult; color: string }) {
  return (
    <article style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {pill(model.model, color)}
        {pill(`${model.grammarOperatorNodes} grammar nodes`, C.purple)}
        {pill(`${model.freeParameterCount} params`, C.blue)}
      </div>
      <h2 style={{ color: C.text, fontSize: 18, lineHeight: 1.25, margin: "0 0 12px" }}>{title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        <Metric label="Best gamma" value={fmt(model.bestGamma)} color={color} />
        <Metric label="MSE" value={fmt(model.bestMse)} color={C.orange} />
        <Metric label="Error vs gamma1" value={fmt(model.errorFromFirstKnownZero)} color={C.green} />
      </div>
    </article>
  );
}

export default function EmlPrimeResidualPage() {
  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 18px 72px" }}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28, fontSize: 12 }}>
          <a href="/" style={{ color: C.muted, textDecoration: "none" }}>monogate.dev</a>
          <a href="/explorer" style={{ color: C.muted, textDecoration: "none" }}>Explorer</a>
          <a href="/explorer/eml-atlas-annex" style={{ color: C.muted, textDecoration: "none" }}>Atlas Annex</a>
          <a href="/explorer/eml-symbolic-regression" style={{ color: C.muted, textDecoration: "none" }}>Template Search</a>
          <a href="/explorer/eml-language" style={{ color: C.muted, textDecoration: "none" }}>EML Language</a>
        </nav>

        <header style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {pill("EML-A2", C.orange)}
            {pill(benchmark.status, C.green)}
            {pill("candidate benchmark", C.blue)}
            {pill("no RH claim", C.green)}
          </div>
          <h1 style={{ color: C.orange, fontSize: 34, lineHeight: 1.1, margin: "0 0 12px", fontFamily: "monospace" }}>
            EML Prime Residual Benchmark
          </h1>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, maxWidth: 840, margin: 0 }}>
            A fixed-fixture grammar scan over the Chebyshev psi residual, comparing one EML-shaped frequency parameter with a profiled standard trigonometric basis.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 24 }}>
          <Metric label="Samples" value={benchmark.fixture.sampleCount} color={C.blue} />
          <Metric label="x range" value={`${benchmark.fixture.xMin}-${benchmark.fixture.xMax}`} color={C.purple} />
          <Metric label="Primes <= x max" value={benchmark.fixture.primeCountUpToMax} color={C.green} />
          <Metric label="Known gamma1" value={fmt(benchmark.scan.knownFirstZetaZeroGamma)} color={C.orange} />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 12, marginBottom: 24 }}>
          <ModelCard title="EML-shaped scan" model={benchmark.scan.eml} color={C.green} />
          <ModelCard title="Standard profiled scan" model={benchmark.scan.standard} color={C.blue} />
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            interpretation
          </div>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>
            {benchmark.interpretation.summary}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {pill(`EML closer: ${benchmark.scan.comparison.emlCloserToFirstKnownZero}`, benchmark.scan.comparison.emlCloserToFirstKnownZero ? C.green : C.red)}
            {pill(`standard lower MSE: ${benchmark.scan.comparison.standardLowerMse}`, benchmark.scan.comparison.standardLowerMse ? C.blue : C.red)}
            {pill(`null acceptable: ${benchmark.interpretation.nullResultAcceptable}`, C.green)}
          </div>
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            controls
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620, fontSize: 12 }}>
              <thead>
                <tr style={{ color: C.muted, textAlign: "left" }}>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Control</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>EML gamma</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Standard gamma</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {benchmark.negativeControls.map((control) => (
                  <tr key={control.label}>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{control.label}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{fmt(control.emlBestGamma)}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{fmt(control.standardBestGamma)}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px" }}>{pill(control.status, C.orange)}</td>
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
            {benchmark.nonClaims.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

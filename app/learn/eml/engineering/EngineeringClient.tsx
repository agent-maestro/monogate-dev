"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "monogate.learn.eml.engineering.completed";

const ACCENT_GOLD = "#E8A020";
const SURFACE = "#0d0f18";
const SURFACE_2 = "#0a0b12";
const SURFACE_3 = "#06070a";
const SURFACE_BANNER = "#0f1018";
const BORDER = "#1a1c28";
const BORDER_ACCENT = "#e8a02033";
const BORDER_BANNER = "#e8a02022";
const TEXT_BRIGHT = "#f1f1f1";
const TEXT = "#d4d4d4";
const TEXT_MUTED = "#999";
const TEXT_DIM = "#666";
const TEXT_FAINT = "#444";

type Section = {
  heading: string;
  code: string;
  explanation: string[];
};

type Lesson = {
  id: string;
  number: string;
  title: string;
  time: string;
  intro: string;
  sections: Section[];
  exercise: string;
};

const LESSONS: Lesson[] = [
  {
    id: "l1",
    number: "01",
    title: "Multi-function modules",
    time: "10 min",
    intro:
      "Real projects aren't single functions. They're systems — multiple "
      + "equations that call each other, share constants, and compose into "
      + "something larger. EML handles this with modules.",
    sections: [
      {
        heading: "Your first module",
        code: `module climate_control;

const TETENS_A: Real = 17.27
const TETENS_B: Real = 237.3
const TETENS_REF: Real = 0.6108

fn saturation_vp(temp_c: Real) -> Real {
    TETENS_REF * exp((TETENS_A * temp_c) / (TETENS_B + temp_c))
}

fn vpd(temp_c: Real, humidity_pct: Real) -> Real {
    let svp = saturation_vp(temp_c);
    svp * (1.0 - humidity_pct / 100.0)
}

fn vpd_safe(temp_c: Real, humidity_pct: Real) -> Real
    requires (temp_c > 0.0)
    requires (humidity_pct > 0.0)
    requires (humidity_pct < 100.0)
    ensures  (result > 0.0)
{
    vpd(temp_c, humidity_pct)
}`,
        explanation: [
          "module climate_control; — names this file. Other files can import it.",
          "vpd() calls saturation_vp() — functions compose naturally.",
          "vpd_safe() wraps vpd() with contracts — the safety layer calls the math layer.",
          "Three levels: constants → core math → verified interface. This pattern scales to any system.",
        ],
      },
      {
        heading: "Importing modules",
        code: `module greenhouse;

use climate_control;
use stdlib::math;

const TARGET_VPD: Real = 1.2

fn fan_speed(temp_c: Real, humidity_pct: Real) -> Real {
    let current = climate_control::vpd_safe(temp_c, humidity_pct);
    let error = current - TARGET_VPD;
    math::clamp(error * 0.5, 0.0, 1.0)
}`,
        explanation: [
          "use climate_control; — imports the module you just wrote.",
          "climate_control::vpd_safe() — fully qualified call to the imported function.",
          "use stdlib::math; — EML's standard library. Contains clamp, lerp, and more.",
          "The greenhouse module doesn't reimplement VPD math — it calls it. One source of truth.",
        ],
      },
      {
        heading: "Compile the system",
        code: `# Compile both files together
eml-compile climate_control.eml greenhouse.eml --target all -o ./build

# Output: each target gets both modules
# build/climate_control.c   + build/greenhouse.c
# build/climate_control.rs  + build/greenhouse.rs
# build/climate_control.lean + build/greenhouse.lean
# ... all 32 targets`,
        explanation: [],
      },
    ],
    exercise:
      "Split your PID controller from Level 1 into two modules: pid_core "
      + "(the math) and pid_safe (verified wrapper with contracts). Import "
      + "pid_core from pid_safe. Compile both. Verify the Lean output shows "
      + "the composition.",
  },
  {
    id: "l2",
    number: "02",
    title: "The chain-order cost model",
    time: "10 min",
    intro:
      "Chain order isn't just a number — it's a prediction system. It tells "
      + "you how expensive a function is before you run it, how much precision "
      + "it needs, and how much hardware it requires. Learning to think in "
      + "chain order is what separates an EML user from an EML engineer.",
    sections: [
      {
        heading: "The four dimensions of cost",
        code: `# Run the profiler on any .eml file
eml-compile my_function.eml --profile-only

# Output:
# my_function:
#   chain_order: 2
#   cost_class:  p2-d5-w2-c1
#                │  │  │  └─ c1: 1 oscillation mode (cos/sin)
#                │  │  └──── w2: width 2 (widest level has 2 nodes)
#                │  └─────── d5: eml_depth 5 (longest root-to-leaf path)
#                └────────── p2: 2 transcendental layers (chain order)
#   drift_risk:  MEDIUM
#   fpga_estimate:
#     mac_units: ~7
#     trig_units: 1
#     latency:   14 cycles`,
        explanation: [
          "p (Pfaffian depth) = chain order. Roughly 2× the transcendental count.",
          "d (eml_depth) = longest path in the EML tree. Predicts pipeline latency.",
          "w (width) = widest level. Predicts parallel hardware resources needed.",
          "c (oscillation count) = number of sin/cos pairs. Predicts numerical instability.",
        ],
      },
      {
        heading: "Chain order as a design tool",
        code: `# VERSION 1: Naive (chain order higher)
fn damped_wave_v1(t: Real, decay: Real, freq: Real) -> Real {
    exp(-decay * t) * cos(freq * t) * sin(freq * t)
}
# 3 transcendentals — exp, cos, sin

# VERSION 2: Trig identity (chain order lower)
fn damped_wave_v2(t: Real, decay: Real, freq: Real) -> Real {
    exp(-decay * t) * sin(2.0 * freq * t) * 0.5
}
# 2 transcendentals — exp, sin

# Same output. Identical math. One transcendental fewer.
# On an FPGA that's one fewer trig_unit — the difference between
# fitting on a $30 chip and needing a $200 chip.`,
        explanation: [
          "sin(x)·cos(x) = ½ sin(2x) — a trig identity drops one transcendental.",
          "This isn't micro-optimization. trig_units are scarce hardware.",
          "Run --profile-only to see the cost before you build anything.",
          "Rule of thumb: if your function is chain order 4+, look for identities.",
        ],
      },
      {
        heading: "Drift risk and precision",
        code: `# CHAIN 0: Safe at any precision
fn add(a: Real, b: Real) -> Real { a + b }
# drift: NONE — use float16 if you want

# CHAIN 1: Safe at float32+
fn decay(t: Real, k: Real) -> Real { exp(-k * t) }
# drift: LOW — float32 is fine

# CHAIN 2: Needs float32, prefer float64 for safety-critical
fn oscillation(t: Real, f: Real) -> Real { sin(f * t) }
# drift: MEDIUM — float32 ok for short-running, float64 safer

# CHAIN 4+: Use float64; FPGA needs DP hardware
fn nested(x: Real) -> Real { exp(sin(x)) }
# drift: HIGH — float32 will accumulate error`,
        explanation: [
          "Every transcendental layer amplifies floating-point error.",
          "Chain 0–1: use whatever precision you want.",
          "Chain 2: float32 minimum, float64 preferred for safety-critical.",
          "Chain 4+: float64 required. FPGA needs double-precision hardware.",
          "The compiler emits a drift_risk flag. Listen to it.",
        ],
      },
    ],
    exercise:
      "Write three versions of a function that computes A·e^(-bt)·cos(ωt + φ). "
      + "Find the lowest chain order that preserves the behavior. Use "
      + "--profile-only to compare all three. Which version would you put on a "
      + "$30 FPGA?",
  },
  {
    id: "l3",
    number: "03",
    title: "Verification contracts in depth",
    time: "10 min",
    intro:
      "Level 1 showed you @verify with simple requires/ensures. Real "
      + "verification is compositional — you prove small properties about "
      + "small functions, then combine them into system-level guarantees.",
    sections: [
      {
        heading: "Compositional contracts",
        code: `module safe_control;

@verify(lean, theorem = "pid_bounded")
fn pid(error: Real, integral: Real, Kp: Real, Ki: Real) -> Real
    requires (abs(error) < 50.0)
    requires (abs(integral) < 500.0)
    requires (Kp > 0.0) requires (Kp < 10.0)
    requires (Ki > 0.0) requires (Ki < 1.0)
    ensures  (abs(result) < 1000.0)
{
    Kp * error + Ki * integral
}

@verify(lean, theorem = "saturated_in_range")
fn saturate(x: Real, lo: Real, hi: Real) -> Real
    requires (lo < hi)
    ensures  (result >= lo)
    ensures  (result <= hi)
{
    clamp(x, lo, hi)
}

@verify(lean, theorem = "safe_output_bounded")
fn safe_output(error: Real, integral: Real) -> Real
    requires (abs(error) < 50.0)
    requires (abs(integral) < 500.0)
    ensures  (result >= -100.0)
    ensures  (result <= 100.0)
{
    let raw = pid(error, integral, 2.5, 0.1);
    saturate(raw, -100.0, 100.0)
}`,
        explanation: [
          "pid() is proven bounded. saturate() is proven to clamp. safe_output() composes both.",
          "The compiler generates THREE theorems. The third one's proof USES the first two.",
          "This is how you build trust: small proofs compose into system guarantees.",
          "The Lean output shows the dependency chain — theorem C depends on theorems A and B.",
        ],
      },
      {
        heading: "Reading the Lean output",
        code: `-- Generated by Monogate Forge
-- Source: safe_control.eml

import MachLib.EML

def safe_output (error integral : Real) : Real :=
  let raw := 2.5 * error + 0.1 * integral
  max (-100.0) (min raw 100.0)

theorem safe_output_bounded
    (error integral : Real)
    (h1 : abs error < 50.0)
    (h2 : abs integral < 500.0) :
    safe_output error integral >= -100.0 ∧
    safe_output error integral <= 100.0 := by
  unfold safe_output
  constructor
  · -- left: result >= -100.0
    sorry  -- TODO: prove against MachLib
  · -- right: result <= 100.0
    sorry  -- TODO: prove against MachLib`,
        explanation: [
          "The theorem statement is auto-generated and CORRECT — it exactly matches your contract.",
          "The sorry means the proof body isn't filled yet. That's normal for auto-generated output.",
          "The proof structure is already there: constructor splits the ∧ (and) into two goals.",
          "A human or an RL agent fills the sorry. The STATEMENT is the hard part — Forge does that for you.",
        ],
      },
      {
        heading: "Multi-property contracts",
        code: `@verify(lean, theorem = "controller_safe")
fn altitude_hold(
    alt: Real,
    target: Real,
    rate: Real,
    integral: Real
) -> Real
    // Input domain
    requires (alt > 0.0)
    requires (alt < 50000.0)
    requires (target > 100.0)
    requires (target < 45000.0)
    requires (abs(rate) < 200.0)
    requires (abs(integral) < 10000.0)
    // Output guarantees
    ensures (result > -1.0)       // never full nose down
    ensures (result < 1.0)        // never full nose up
    ensures (abs(result) < 0.8)   // stays within 80% authority
{
    let error = target - alt;
    let p_term = 0.001 * error;
    let i_term = 0.0001 * integral;
    let d_term = -0.01 * rate;
    clamp(p_term + i_term + d_term, -0.8, 0.8)
}`,
        explanation: [
          "Multiple requires define the valid operating envelope.",
          "Multiple ensures define what the function GUARANTEES within that envelope.",
          "This IS what DO-178C calls 'high-level requirements verification.'",
          "The Lean theorem has one hypothesis per requires and one conclusion per ensures.",
          "If you can't state the property, you can't prove it. Writing contracts IS the engineering.",
        ],
      },
    ],
    exercise:
      "Build a three-function chain: sensor_read (bounded input), filter "
      + "(smoothing with proven stability), actuator_command (bounded output). "
      + "Write contracts so that the full chain is proven end-to-end: valid "
      + "sensor input → valid actuator output, always.",
  },
  {
    id: "l4",
    number: "04",
    title: "Hardware targeting in depth",
    time: "10 min",
    intro:
      "Level 1 showed @target(fpga) as a one-liner. Real hardware targeting "
      + "means understanding what the FPGA allocator is doing, why precision "
      + "matters, and how to fit your design into a budget.",
    sections: [
      {
        heading: "FPGA resource budgets",
        code: `@target(fpga, clock_mhz = 100, precision = float32)
fn pid_f32(error: Real, integral: Real) -> Real {
    2.5 * error + 0.1 * integral
}
# chain: 0 | mac_units: 2 | trig_units: 0 | latency: 4 cycles

@target(fpga, clock_mhz = 100, precision = float64)
fn pid_f64(error: Real, integral: Real) -> Real {
    2.5 * error + 0.1 * integral
}
# chain: 0 | mac_units: 2 | trig_units: 0 | latency: 6 cycles
#   (float64 still uses 2 MACs but each MAC is 2x wider)

# For chain-0 arithmetic, float32 has ZERO drift risk.
# Use float32. Save the resources for functions that need them.`,
        explanation: [
          "mac_units: multiply-accumulate slots. Maps to FPGA DSP blocks (Artix-7: 240 total).",
          "trig_units: dedicated transcendental hardware. Chain order ≥ 1 needs these.",
          "exp_units, ln_units: similar to trig but for exp/log families.",
          "latency: clock cycles from input valid to output valid. Determines your control loop rate.",
        ],
      },
      {
        heading: "When precision matters",
        code: `# Chain 0: float32 is identical to float64
@target(fpga, precision = float32)
fn gravity(m1: Real, m2: Real, r: Real) -> Real {
    6.674e-11 * m1 * m2 / (r * r)
}
# drift: NONE — float32 is fine

# Chain 2: float32 diverges from float64 after ~1000 iterations
@target(fpga, precision = float32)
fn oscillator(t: Real, freq: Real) -> Real {
    sin(freq * t)
}
# drift: MEDIUM — float32 ok for audio (short), not for navigation (long)

# Chain 4+: float32 is dangerous
@target(fpga, precision = float64)
fn damped_osc(t: Real, d: Real, f: Real) -> Real {
    exp(-d * t) * sin(f * t)
}
# drift: HIGH — use float64, the extra resources are worth it`,
        explanation: [
          "Drift risk isn't about single evaluations — it's about ACCUMULATION over time.",
          "A game running at 60fps for 1 minute: 3,600 evaluations. float32 chain-2 is fine.",
          "A flight controller at 1kHz for 8 hours: 28.8M evaluations. float32 chain-2 will drift.",
          "Match precision to your application's time horizon, not just the function's complexity.",
        ],
      },
      {
        heading: "Multi-target hardware",
        code: `# Same function, three hardware profiles
@target(fpga, device = "artix7_100t", clock_mhz = 100)
@target(fpga, device = "zynq_7020", clock_mhz = 200)
@target(fpga, device = "asic_28nm")
fn autopilot_inner(roll_err: Real, pitch_err: Real) -> (Real, Real) {
    let aileron = clamp(2.5 * roll_err, -1.0, 1.0);
    let elevator = clamp(1.8 * pitch_err, -1.0, 1.0);
    (aileron, elevator)
}

# Artix-7:  2 DSP, 2 cycles @ 100MHz = 20ns
# Zynq:     2 DSP, 2 cycles @ 200MHz = 10ns
# ASIC 28nm: ~300 gates, 1 cycle @ 500MHz = 2ns`,
        explanation: [
          "Same math targets different hardware automatically.",
          "The FPGA allocator adjusts pipeline depth for the target clock speed.",
          "ASIC mode estimates gate count for custom silicon (Phase 3 of the master roadmap).",
          "You design the math ONCE. Forge handles the hardware mapping.",
        ],
      },
    ],
    exercise:
      "Take the altitude_hold controller from Lesson 3. Target it to an "
      + "Artix-7 at float32 and float64. Compare resource usage. Now add "
      + "exp(-decay * t) to the output (simulating a transient response). How "
      + "does the FPGA estimate change? At what chain order does the Artix-7 "
      + "run out of exp hardware units?",
  },
  {
    id: "l5",
    number: "05",
    title: "Multi-target workflows",
    time: "10 min",
    intro:
      "The real power of EML isn't any single target — it's that one source "
      + "file produces ALL targets simultaneously, and they're all guaranteed "
      + "to compute the same math.",
    sections: [
      {
        heading: "The development workflow",
        code: `# Step 1: Write and test in Python (fast iteration)
eml-compile controller.eml --target python -o controller.py
python -c "import controller; print(controller.pid(1.0, 0.0, 2.5, 0.1))"

# Step 2: Verify with Lean (prove correctness)
eml-compile controller.eml --target lean -o controller.lean
cd lean-project && lake build  # Lean kernel says yes or no

# Step 3: Build production in Rust (performance)
eml-compile controller.eml --target rust -o controller.rs
cargo build --release

# Step 4: Generate certified Ada (safety-critical, Pro tier)
eml-compile controller.eml --target ada -o controller.ads
gnatprove -P controller.gpr  # SPARK formal analysis

# Step 5: Synthesize FPGA (hardware, Pro tier)
eml-compile controller.eml --target verilog -o controller.v
vivado -mode batch -source synth.tcl  # synthesis

# All five outputs compute EXACTLY the same math.
# Change the .eml file → all five update together.`,
        explanation: [
          "Python for prototyping (seconds to test).",
          "Lean for verification (minutes to prove).",
          "Rust/C for production deployment (performance).",
          "Ada/SPARK for safety-critical certification.",
          "Verilog for hardware acceleration.",
          "One source. Many targets. Zero translation errors.",
        ],
      },
      {
        heading: "CI/CD integration",
        code: `# .github/workflows/verify.yml
name: EML Verify
on: [push]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install monogate-forge

      # Compile all targets
      - run: eml-compile src/*.eml --target all -o build/

      # Run Python tests
      - run: pytest build/test_*.py

      # Verify Lean proofs
      - run: cd build && lake build

      # Check chain-order budget (every fn <= chain 3)
      - run: |
          for f in src/*.eml; do
            eml-compile "$f" --profile-only \\
              | grep -E "chain_order: [4-9]|chain_order: [1-9][0-9]+" \\
              && exit 1 || true
          done`,
        explanation: [
          "Every push compiles, tests, and verifies automatically.",
          "The grep pass enforces a complexity budget in CI — fails on chain ≥ 4.",
          "If someone adds a chain-4 function, the build fails. Intentional.",
          "The proof check catches contract violations before deployment.",
        ],
      },
      {
        heading: "When to use which target",
        code: `# DECISION MATRIX
#
# Need speed?         → C, Rust, or FPGA (Verilog)
# Need safety cert?   → Ada/SPARK (DO-178C), then Lean proof
# Need prototyping?   → Python
# Need browser?       → JavaScript (WebAssembly Pro)
# Need browser GPU?   → WGSL (WebGPU)
# Need mobile GPU?    → Metal (iOS) or GLSL ES (Android)
# Need iOS / macOS?   → Swift
# Need game engine?   → C# (Unity), GDScript (Godot), Luau (Roblox)
# Need smart contract?→ Solidity
# Need formal proof?  → Lean, Coq, or Isabelle/HOL
# Need automotive?    → AUTOSAR (.arxml)
# Need avionics?      → AADL + Ada/SPARK
# Need robotics?      → ROS2 package
# Need MATLAB compat? → MATLAB (.m)
#
# Need ALL of them?   → --target all`,
        explanation: [],
      },
    ],
    exercise:
      "Build a complete temperature controller system: sensor model "
      + "(generates fake data), PID controller, and safety monitor. Set up a "
      + "CI workflow that compiles to Python (for testing), Lean (for "
      + "verification), and C (for deployment). Make the CI fail if any "
      + "function exceeds chain order 2.",
  },
  {
    id: "l6",
    number: "06",
    title: "The standard library",
    time: "10 min",
    intro:
      "EML's standard library gives you building blocks so you don't reinvent "
      + "common math. Everything in stdlib is chain-order profiled and the "
      + "stable kernels carry @verify contracts.",
    sections: [
      {
        heading: "stdlib::math",
        code: `use stdlib::math;

// Interpolation
let smoothed = math::lerp(current, target, 0.1);
let eased = math::smoothstep(0.0, 1.0, t);

// Clamping and ranges
let bounded = math::clamp(value, -1.0, 1.0);
let mapped = math::remap(sensor, 0.0, 1023.0, 0.0, 5.0);

// Constants
let circle = 2.0 * math::PI * radius;
let natural = math::E;`,
        explanation: [
          "lerp: linear interpolation. Chain order 0. The most common operation in gaming and control.",
          "smoothstep: smooth Hermite interpolation. Chain order 0. Produces S-curves without trig.",
          "remap: rescale a value from one range to another. Chain order 0.",
          "All chain order 0 — no transcendentals, pure arithmetic.",
        ],
      },
      {
        heading: "stdlib::signal",
        code: `use stdlib::signal;

// Digital filters
let lp = signal::biquad_lowpass(input, cutoff, q, sample_rate);
let hp = signal::biquad_highpass(input, cutoff, q, sample_rate);

// Windowing
let w = signal::hann_window(n, length);
let w2 = signal::blackman_window(n, length);

// Oscillators
let sine = signal::sine_osc(phase, freq, sample_rate);
let saw = signal::saw_osc(phase, freq, sample_rate);`,
        explanation: [
          "biquad filters: proven stable (poles inside unit circle). Chain order 0–1.",
          "Window functions: proven bounded in [0,1]. Used in FFT and audio.",
          "Oscillators: phase-accumulator based. No drift over time.",
          "Every stdlib::signal function has a @verify contract for stability.",
        ],
      },
      {
        heading: "stdlib::control",
        code: `use stdlib::control;

// PID with anti-windup
let output = control::pid_aw(
    error, integral, derivative,
    Kp, Ki, Kd,
    integral_limit
);

// State observer
let estimated = control::luenberger(
    state, measurement, A, B, C, L
);

// Trajectory generation
let pos = control::trapezoid_profile(t, v_max, a_max, distance);`,
        explanation: [
          "pid_aw: PID with anti-windup. Proven bounded. The version you actually use in production.",
          "luenberger: state observer for estimating unmeasured states. Chain order 0.",
          "trapezoid_profile: motion profile with acceleration limits. Chain order 0.",
          "Control engineers: these are the functions you've written a hundred times. Now they're proven.",
        ],
      },
    ],
    exercise:
      "Build a complete audio synthesizer using only stdlib functions: "
      + "sine_osc for the oscillator, biquad_lowpass for the filter, and lerp "
      + "for the envelope. Compile to C. The output should be a function that "
      + "takes (time, note_frequency, filter_cutoff, envelope_position) and "
      + "returns an audio sample.",
  },
];

const TRACK_LINKS = [
  { path: "aerospace", label: "Aerospace", desc: "Flight controllers & autopilots" },
  { path: "gaming", label: "Gaming", desc: "Physics, shaders & audio" },
  { path: "robotics", label: "Robotics", desc: "Kinematics & control" },
  { path: "audio", label: "Audio DSP", desc: "Synthesizers & effects" },
  { path: "medical", label: "Medical", desc: "Device controllers" },
  { path: "defi", label: "DeFi", desc: "Smart contracts & AMMs" },
];

function readCompletedFromStorage(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function writeCompletedToStorage(ids: Set<string>): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(ids).sort()),
    );
  } catch {
    // localStorage unavailable in private browsing -- silently no-op.
  }
}

export default function EngineeringClient() {
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(),
  );
  const [hydrated, setHydrated] = useState(false);

  // Load saved completion state on mount.
  useEffect(() => {
    setCompletedLessons(readCompletedFromStorage());
    setHydrated(true);
  }, []);

  function toggleComplete(id: string) {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeCompletedToStorage(next);
      return next;
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#08090e",
        color: TEXT,
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "48px 24px 0",
        }}
      >
        <a
          href="/learn/eml"
          style={{
            color: ACCENT_GOLD,
            textDecoration: "none",
            fontSize: 13,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            letterSpacing: 1,
          }}
        >
          ← /learn/eml
        </a>

        <p
          style={{
            color: TEXT_DIM,
            fontSize: 12,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            marginTop: 24,
            marginBottom: 4,
          }}
        >
          Monogate Forge · Level 2
        </p>

        <h1
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: TEXT_BRIGHT,
            margin: "0 0 8px",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Engineering with EML
        </h1>

        <p
          style={{
            fontSize: 17,
            color: TEXT_MUTED,
            lineHeight: 1.6,
            marginBottom: 8,
            maxWidth: 640,
          }}
        >
          Six lessons, ten minutes each. By the end you'll know how to
          structure multi-module systems, think in chain-order cost, write
          compositional verification contracts, target real hardware, and
          build CI pipelines that prove your math on every push.
        </p>

        <p style={{ fontSize: 14, color: TEXT_DIM, marginBottom: 32 }}>
          <strong style={{ color: TEXT }}>Prerequisite:</strong>{" "}
          <a
            href="/learn/eml/intro"
            style={{ color: ACCENT_GOLD, textDecoration: "none" }}
          >
            Level 1 (EML in 30 Minutes)
          </a>
          .{" "}
          <strong style={{ color: TEXT }}>Time:</strong> ~60 minutes.
        </p>

        {/* Progress bar */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 40,
          }}
        >
          {LESSONS.map((l) => (
            <div
              key={l.id}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background:
                  hydrated && completedLessons.has(l.id) ? ACCENT_GOLD : BORDER,
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Lessons */}
      <div
        style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}
      >
        {LESSONS.map((lesson) => {
          const isActive = activeLesson === lesson.id;
          const isComplete = hydrated && completedLessons.has(lesson.id);

          return (
            <div key={lesson.id} style={{ marginBottom: 16 }}>
              {/* Lesson header */}
              <button
                onClick={() => setActiveLesson(isActive ? null : lesson.id)}
                aria-expanded={isActive}
                aria-controls={`lesson-${lesson.id}-content`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "20px 24px",
                  background: isActive ? SURFACE : SURFACE_2,
                  border: `1px solid ${isActive ? BORDER_ACCENT : BORDER}`,
                  borderRadius: isActive ? "12px 12px 0 0" : 12,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  color: TEXT,
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 13,
                    color: isComplete ? ACCENT_GOLD : TEXT_FAINT,
                    minWidth: 32,
                  }}
                >
                  {isComplete ? "✓" : lesson.number}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: TEXT_BRIGHT,
                    }}
                  >
                    {lesson.title}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: "#555",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  {lesson.time}
                </span>
                <span
                  style={{
                    fontSize: 18,
                    color: "#555",
                    transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  ▾
                </span>
              </button>

              {/* Lesson content */}
              {isActive && (
                <div
                  id={`lesson-${lesson.id}-content`}
                  style={{
                    background: SURFACE,
                    border: `1px solid ${BORDER_ACCENT}`,
                    borderTop: "none",
                    borderRadius: "0 0 12px 12px",
                    padding: "32px 24px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      color: "#bbb",
                      lineHeight: 1.7,
                      marginBottom: 32,
                    }}
                  >
                    {lesson.intro}
                  </p>

                  {lesson.sections.map((section, si) => (
                    <div key={si} style={{ marginBottom: 36 }}>
                      <h3
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: ACCENT_GOLD,
                          marginBottom: 16,
                        }}
                      >
                        {section.heading}
                      </h3>

                      <pre
                        style={{
                          background: SURFACE_3,
                          border: `1px solid ${BORDER}`,
                          borderRadius: 8,
                          padding: 20,
                          overflowX: "auto",
                          fontSize: 13,
                          lineHeight: 1.6,
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, monospace",
                          color: "#c8c8c8",
                          marginBottom:
                            section.explanation.length > 0 ? 16 : 0,
                          whiteSpace: "pre",
                        }}
                      >
                        {section.code}
                      </pre>

                      {section.explanation.length > 0 && (
                        <div
                          style={{
                            background: "#0a0b10",
                            border: `1px solid ${BORDER}`,
                            borderRadius: 8,
                            padding: "16px 20px",
                          }}
                        >
                          {section.explanation.map((exp, ei) => (
                            <p
                              key={ei}
                              style={{
                                fontSize: 13,
                                color: TEXT_MUTED,
                                lineHeight: 1.6,
                                marginBottom:
                                  ei < section.explanation.length - 1 ? 8 : 0,
                                paddingLeft: 12,
                                borderLeft: `2px solid ${BORDER}`,
                              }}
                            >
                              {exp}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Exercise */}
                  <div
                    style={{
                      background: SURFACE_BANNER,
                      border: `1px solid ${BORDER_BANNER}`,
                      borderRadius: 8,
                      padding: "20px 24px",
                      marginTop: 24,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: ACCENT_GOLD,
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, monospace",
                        letterSpacing: 2,
                        marginBottom: 8,
                      }}
                    >
                      EXERCISE
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#bbb",
                        lineHeight: 1.7,
                        margin: 0,
                      }}
                    >
                      {lesson.exercise}
                    </p>
                  </div>

                  {/* Complete button */}
                  <button
                    onClick={() => toggleComplete(lesson.id)}
                    aria-pressed={isComplete}
                    style={{
                      display: "block",
                      width: "100%",
                      marginTop: 24,
                      padding: "12px 0",
                      background: isComplete
                        ? "rgba(232, 160, 32, 0.08)"
                        : "transparent",
                      border: `1px solid ${isComplete ? ACCENT_GOLD : "#333"}`,
                      borderRadius: 8,
                      color: isComplete ? ACCENT_GOLD : TEXT_DIM,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontFamily: "inherit",
                    }}
                  >
                    {isComplete
                      ? "✓ Lesson complete"
                      : `Mark Lesson ${lesson.number} complete`}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* What's next */}
        <div
          style={{
            marginTop: 48,
            padding: "32px 24px",
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: TEXT_BRIGHT,
              marginBottom: 16,
            }}
          >
            What's next?
          </h2>
          <p
            style={{
              fontSize: 14,
              color: TEXT_MUTED,
              lineHeight: 1.7,
              marginBottom: 20,
            }}
          >
            You now have the engineering foundations. Pick a domain and go
            deep:
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {TRACK_LINKS.map((track) => (
              <a
                key={track.path}
                href={`/learn/eml/${track.path}`}
                style={{
                  display: "block",
                  padding: "16px 20px",
                  background: SURFACE_2,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: TEXT_BRIGHT,
                    marginBottom: 4,
                  }}
                >
                  {track.label} →
                </div>
                <div style={{ fontSize: 12, color: TEXT_DIM }}>
                  {track.desc}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 48,
            textAlign: "center",
            fontSize: 12,
            color: TEXT_FAINT,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          Monogate Research ·{" "}
          <a href="https://monogate.org" style={{ color: TEXT_DIM }}>
            monogate.org
          </a>{" "}
          ·{" "}
          <a href="https://monogate.dev" style={{ color: TEXT_DIM }}>
            monogate.dev
          </a>{" "}
          ·{" "}
          <a
            href="https://github.com/agent-maestro/forge"
            style={{ color: TEXT_DIM }}
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

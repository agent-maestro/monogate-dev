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

use local::climate_control;

const TARGET_VPD: Real = 1.2

fn fan_speed(temp_c: Real, humidity_pct: Real) -> Real {
    let current = vpd_safe(temp_c, humidity_pct);
    let error = current - TARGET_VPD;
    clamp(error * 0.5, 0.0, 1.0)
}`,
        explanation: [
          "use local::climate_control; — imports climate_control.eml from the same directory.",
          "Imported functions are called by their plain name: vpd_safe(...). A qualified call like climate_control::vpd_safe(...) does not parse.",
          "clamp is built in. The standard library imports the same way: use stdlib::math::{lerp}; (Lesson 6).",
          "The greenhouse module doesn't reimplement VPD math — it calls it. One source of truth.",
        ],
      },
      {
        heading: "Compile the system",
        code: `# One source per command: greenhouse.eml pulls in climate_control.eml itself
eml-compile greenhouse.eml --target c -o greenhouse.c
eml-compile greenhouse.eml --target python -o greenhouse.py

# The climate_control code greenhouse needs (its constants and vpd)
# is compiled into greenhouse.c.`,
        explanation: [],
      },
    ],
    exercise:
      "Split your PID controller from Level 1 into two modules: pid_core "
      + "(the math) and pid_safe (the wrapper with contracts). Import "
      + "pid_core from pid_safe with use local::pid_core;, compile "
      + "pid_safe.eml to Lean, and look at how pid_core's math appears in "
      + "the theorem.",
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

# Output for damped_wave, exp(-decay * t) * cos(freq * t):
#   damped_wave
#     status: ok    chain_order: 3    cost_class: p3-d5-w2-c0    eml_depth: 5    drift: HIGH
#     dynamics: 1 osc, 1 decay  (predicted_r=3)
#     fpga: 5 MAC, 1 exp, 0 ln, 1 trig (10 cy @ 64-bit)
#
# cost_class p3-d5-w2-c0
#            │  │  │  └─ c0: no primitive outside EML
#            │  │  └──── w2: chain order along the deepest single path
#            │  └─────── d5: eml_depth, the longest root-to-leaf path
#            └────────── p3: chain order of the whole function`,
        explanation: [
          "p = chain order: how many transcendental layers the function stacks. It matches chain_order.",
          "d = eml_depth, the longest path in the EML tree. The FPGA estimate tracks it: 2 cycles per level in these examples.",
          "w = the chain order along the deepest single path. In damped_wave, exp and cos sit on different branches, so w is 2 while p is 3.",
          "c = 1 when the function uses a primitive that is Pfaffian but not expressible in EML (Bessel, Airy, Lambert W); 0 otherwise.",
        ],
      },
      {
        heading: "Cost as a design tool",
        code: `# VERSION 1: three transcendentals (exp, cos, sin)
fn damped_wave_v1(t: Real, decay: Real, freq: Real) -> Real {
    exp(-decay * t) * cos(freq * t) * sin(freq * t)
}
# chain_order: 3    fpga: 5 MAC, 1 exp, 0 ln, 2 trig

# VERSION 2: trig identity (exp, sin)
fn damped_wave_v2(t: Real, decay: Real, freq: Real) -> Real {
    exp(-decay * t) * sin(2.0 * freq * t) * 0.5
}
# chain_order: 3    fpga: 5 MAC, 1 exp, 0 ln, 1 trig

# Same output, same chain order. One trig unit fewer.`,
        explanation: [
          "sin(x)·cos(x) = ½ sin(2x) — a trig identity drops one transcendental.",
          "Chain order does not move here (both are 3). The FPGA estimate does: 2 trig units become 1.",
          "This isn't micro-optimization. trig_units are scarce hardware.",
          "Run --profile-only on both versions to see the cost before you build anything.",
        ],
      },
      {
        heading: "Drift risk and precision",
        code: `# What --profile-only reports for each:

# CHAIN 0 · drift: LOW
fn add(a: Real, b: Real) -> Real { a + b }

# CHAIN 1 · drift: MEDIUM
fn decay(t: Real, k: Real) -> Real { exp(-k * t) }

# CHAIN 2 · drift: MEDIUM
fn oscillation(t: Real, f: Real) -> Real { sin(f * t) }

# CHAIN 3 · drift: HIGH
fn nested(x: Real) -> Real { exp(sin(x)) }`,
        explanation: [
          "Every transcendental layer amplifies floating-point error, and the drift flag rises with chain order: LOW, MEDIUM, MEDIUM, HIGH for these four.",
          "A single exp is already MEDIUM. Even chain 1 deserves a check of its domain and exponent size.",
          "For damped_wave (HIGH, above) the FPGA estimate is already 64-bit.",
          "The compiler emits the drift flag for every function. Listen to it.",
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
          "The compiler emits THREE theorems, one per @verify. With monogate-forge 0.14.4, #print axioms shows two proved and one not.",
          "saturated_in_range and safe_output_bounded are proved: no sorryAx.",
          "pid_bounded is true (the output stays under 10·50 + 1·500 = 1000) but not proved: the tactics Forge tries do not find a proof for a bound that multiplies two bounded inputs, like Kp · error.",
          "safe_output_bounded does not need pid_bounded. The saturate alone keeps the output in [-100, 100] whatever pid returns, so a clamp at the boundary makes the system property provable while an inner one is still open.",
        ],
      },
      {
        heading: "Reading the Lean output",
        code: `-- safe_control.lean from monogate-forge 0.14.4 (excerpt)

noncomputable def safe_output (error : Real) (integral : Real) : Real :=
  (min (max (((2.5 : Real) * error) + ((0.1 : Real) * integral)) (-100.0 : Real)) (100.0 : Real))

theorem safe_output_bounded (error : Real) (integral : Real)
    (h1 : ((abs error) < (50.0 : Real)))
    (h2 : ((abs integral) < (500.0 : Real)))
    (h_clamp1 : (-100.0 : Real) ≤ (100.0 : Real)) :
    (((safe_output error integral) >= (-(100.0 : Real)))) ∧ (((safe_output error integral) <= (100.0 : Real))) := by
  unfold safe_output
  refine ⟨?_, ?_⟩ <;>
    first
    | (apply lo_le_clamp <;> (first | assumption | mach_positivity))
    | apply clamp_le_hi
    -- ... 13 more tactics, tried in order ...
    | sorry  -- out of reach; left for the prover`,
        explanation: [
          "One hypothesis per requires, one conclusion per ensures. Forge adds h_clamp1 itself: a clamp needs lo ≤ hi.",
          "safe_output's body is pid and saturate inlined. This release proves the composed expression directly, not by citing the first two theorems.",
          "The tactic list ends in sorry as a last resort, present whether or not an earlier tactic worked. The word itself tells you nothing.",
          "#print axioms does: no sorryAx for safe_output_bounded, so it is proved. Level 1, Lesson 4 shows the command.",
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
      "Level 1 showed @target(fpga) as a one-liner. This lesson reads what the "
      + "compiler does with it: the allocator's resource plan, the fixed-point "
      + "width it picks for a module, and one kernel planned for five parts. "
      + "Every figure below is output from monogate-forge 0.14.4.",
    sections: [
      {
        heading: "FPGA resource budgets",
        code: `module pid_fpga;

@target(fpga, clock_mhz = 100)
fn pid(error: Real, integral: Real) -> Real {
    2.5 * error + 0.1 * integral
}`,
        explanation: [
          "@target(fpga, ...) marks the function for the FPGA allocator, which needs at least one such function. clock_mhz is the clock the plan assumes.",
          "Save this as pid_fpga.eml. The next section asks the allocator what it costs.",
        ],
      },
      {
        heading: "Reading the allocation plan",
        code: `$ eml-compile pid_fpga.eml --allocate

  FPGA allocation plan for Arty A7-100
  Pipeline depth: 2 stages
  Clock target:   100 MHz
  Throughput:     50.0 Msamples/s

  Resources:    100 LUTs     2 DSPs      0 KB BRAM
  MAC units:  2
  Transcendental units: none (pure-polynomial design)`,
        explanation: [
          "With no --fpga-target, the plan is for the Arty A7-100 board (xilinx.artix7). The allocator's budget for it is 63,400 LUTs and 240 DSP slices; this design uses 100 and 2.",
          "MAC units are multipliers. 2.5 * error and 0.1 * integral are two products, and each gets a DSP slice.",
          "The plan's throughput is its own formula, clock ÷ pipeline depth: 100 MHz over 2 stages gives 50. The depth comes from the design, and it stays at 2 at clock_mhz = 50, 200 and 500.",
          "Check the RTL, not the plan. Simulated in Verilator, the emitted pid_pipeline takes a new sample on every clock edge and returns each result 3 cycles later, as its header says (\"Total latency: 3 cycles\"). That is 100 Msamples/s at 100 MHz, twice the plan's figure.",
          "The costs are estimates from a per-part table, not a synthesis report. Synthesize the Verilog before you choose a part.",
        ],
      },
      {
        heading: "Who picks the precision",
        code: `module precision_demo;

// chain 0 · drift LOW
@target(fpga)
fn gravity(m1: Real, m2: Real, r: Real) -> Real {
    6.674e-11 * m1 * m2 / (r * r)
}

// chain 2 · drift MEDIUM
@target(fpga)
fn oscillator(t: Real, freq: Real) -> Real {
    sin(freq * t)
}

// chain 3 · drift HIGH
@target(fpga)
fn damped_osc(t: Real, d: Real, f: Real) -> Real {
    exp(-d * t) * sin(f * t)
}`,
        explanation: [
          "The comments repeat the chain order and drift flag the profiler prints for each function.",
          "The drift flag describes a single evaluation. Error only piles up when an output feeds back into the next step, so check the loop, not just the function.",
          "You don't set the width. @target accepts precision = float32 or float64, but in 0.14.4 that changes nothing: the Verilog is byte-identical either way, apart from the module name.",
        ],
      },
      {
        heading: "One wide function widens the module",
        code: `$ eml-compile precision_demo.eml --target verilog -o precision_demo.v
$ grep -A2 "^module" precision_demo.v
module gravity_pipeline #(
    parameter WIDTH = 64,
    parameter FRAC  = 32
--
module oscillator_pipeline #(
    parameter WIDTH = 64,
    parameter FRAC  = 32
--
module damped_osc_pipeline #(
    parameter WIDTH = 64,
    parameter FRAC  = 32

# Delete damped_osc and compile again:
#   gravity_pipeline and oscillator_pipeline get WIDTH = 32, FRAC = 16`,
        explanation: [
          "The HDL backends are fixed point, with no float in the RTL. WIDTH 64 with FRAC 32 is Q32.32; WIDTH 32 with FRAC 16 is Q16.16.",
          "The profiler sizes gravity and oscillator at 32 bits and only damped_osc at 64. The Verilog puts all three pipelines at 64.",
          "The plan prices it. On the Artix-7 it estimates 8,550 LUTs and 29 DSPs for this module, and 1,700 LUTs and 10 DSPs without damped_osc. Its sin unit estimate doubles, from 1,400 LUTs at 32 bits to 2,800 at 64.",
          "Moving damped_osc into a module of its own keeps the other two at 32 bits.",
        ],
      },
      {
        heading: "Five parts, one kernel",
        code: `$ eml-compile pid_fpga.eml --allocate --fpga-target xilinx.artix7
$ eml-compile pid_fpga.eml --allocate --fpga-target intel.cyclone10
$ eml-compile pid_fpga.eml --allocate --fpga-target lattice.ecp5
$ eml-compile pid_fpga.eml --allocate --fpga-target lattice.ice40
$ eml-compile pid_fpga.eml --allocate --fpga-target asic.sky130

# The Resources line of each plan. All five: 2 stages, 50 Msamples/s.
#   Arty A7-100                  100 LUTs   2 DSPs
#   Cyclone 10 LP 10CL025        120 LUTs   2 DSPs
#   ECP5 LFE5UM-85F              100 LUTs   2 DSPs
#   iCE40 UltraPlus 5K           160 LUTs   2 DSPs
#   SkyWater SKY130 (open-PDK)  8000 LUTs   0 DSPs`,
        explanation: [
          "--fpga-target picks the part. The pipeline stays the same and the cost table changes.",
          "asic.sky130 is a 130 nm ASIC process, not an FPGA. Its plan keeps the FPGA field names, but its LUTs are NAND2-equivalent gates, and with no DSP slices the multipliers are built from standard cells.",
          "Choose the part on the command line. @target has no working device option in 0.14.4: device = \"zynq_7020\" is accepted and ignored, and the plan is still for the Arty A7-100.",
          "A plan does not mean the RTL exists. A function that returns a tuple, (Real, Real), gets a plan from --allocate, but --target verilog stops with an emission-gate error: unsupported construct NodeKind.TUPLE.",
        ],
      },
    ],
    exercise:
      "Take altitude_hold from Lesson 3 and put @target(fpga, clock_mhz = 100) "
      + "above its @verify line. --allocate should report 4 MAC units, 200 LUTs, "
      + "4 DSPs and 4 stages. Add an input t and multiply the controller's sum by "
      + "exp(-0.5 * t) inside the clamp. What does the plan say the exp unit "
      + "costs on each of the five parts? Then write a kernel that adds three exp "
      + "terms with different decay rates. The Artix-7 plan marks the three exp "
      + "units shared and prices them as one, and the iCE40 plan refuses the "
      + "design. Now emit the Verilog: count the eml_exp instances, and compare "
      + "the header's Total latency with the plan's pipeline depth. Which numbers "
      + "describe the hardware?",
  },
  {
    id: "l5",
    number: "05",
    title: "Multi-target workflows",
    time: "10 min",
    intro:
      "The real power of EML isn't any single target — it's that one source "
      + "file can produce a reviewed bundle of selected artifacts, with each "
      + "target carrying its own validation evidence and claim boundary.",
    sections: [
      {
        heading: "The development workflow",
        code: `# Step 1: Write and test in Python (fast iteration)
eml-compile controller.eml --target python -o controller.py
python -c "import controller; print(controller.pid(1.0, 0.0, 2.5, 0.1))"

# Step 2: Emit Lean, then ask Lean which theorems are proved
eml-compile controller.eml --target lean -o controller.lean
echo '#print axioms controller_safe' >> controller.lean
cd machlib/foundations && lake env lean /path/to/controller.lean  # sorryAx = not proved

# Step 3: Build production in Rust (performance)
eml-compile controller.eml --target rust -o controller.rs
cargo build --release

# Step 4: Generate Ada/SPARK-shaped artifacts (safety review)
eml-compile controller.eml --target ada -o controller.ads
gnatprove -P controller.gpr  # SPARK formal analysis

# Step 5: Emit an FPGA candidate (needs @target(fpga) in the source)
eml-compile controller.eml --target verilog -o controller.v
vivado -mode batch -source synth.tcl  # synthesis

# Each output needs target-specific validation evidence.
# Change the .eml file → regenerate the reviewed artifact bundle.`,
        explanation: [
          "Python for prototyping (seconds to test).",
          "Lean: one theorem per @verify contract. #print axioms shows which are proved — sorryAx in the list means not proved.",
          "Rust/C for production-oriented code review.",
          "Ada/SPARK for safety-critical analysis paths.",
          "Verilog for hardware candidates after simulation and synthesis.",
          "One source. Many artifacts. Validation is explicit per target.",
        ],
      },
      {
        heading: "CI/CD integration",
        code: `# .github/workflows/eml.yml
name: EML
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install monogate-forge

      # eml-compile takes one source per call, so loop over the files
      - run: |
          mkdir -p build/python build/c
          for f in src/*.eml; do
            name=$(basename "$f" .eml)
            eml-compile "$f" --target python -o "build/python/$name.py"
            eml-compile "$f" --target c -o "build/c/$name.c"
          done

      # Chain-order budget: fail if any function is chain order 4 or more
      - run: |
          for f in src/*.eml; do
            eml-compile "$f" --profile-only > profile.txt
            if grep -qE "chain_order: ([4-9]|[1-9][0-9]+)" profile.txt; then
              echo "$f is over the chain-order budget"
              exit 1
            fi
          done`,
        explanation: [
          "Every push emits Python and C for every source file.",
          "One source per eml-compile call, so the workflow loops. A glob passes every file at once and fails.",
          "The --profile-only pass enforces a complexity budget: a chain-order-4 function fails the build. Intentional.",
          "Lean is left out on purpose: checking proofs needs a MachLib build (Step 2), which is a job of its own.",
        ],
      },
      {
        heading: "When to use which target",
        code: `# DECISION MATRIX
#
# Need speed?         → C or Rust first; FPGA after hardware evidence
# Need safety cert?   → Ada/SPARK + completed proof evidence
# Need prototyping?   → Python
# Need browser?       → JavaScript or WebAssembly
# Need browser GPU?   → WGSL (WebGPU)
# Need mobile GPU?    → Metal (iOS) or GLSL ES (Android)
# Need iOS / macOS?   → Swift
# Need game engine?   → C# (Unity), GDScript (Godot), Luau (Roblox)
# Need smart contract?→ Solidity
# Need formal proof?  → Lean, Coq, or Isabelle/HOL with completed proofs
# Need automotive?    → AUTOSAR (.arxml)
# Need avionics?      → AADL + Ada/SPARK
# Need robotics?      → ROS2 package
# Need MATLAB compat? → MATLAB (.m)
#
# Need a public claim?→ evidence packet first`,
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
      "The standard library ships inside the compiler as plain EML files — "
      + "math, signal, control, linalg, ml and constants — so you can read "
      + "every function you call. Import the ones you need by name.",
    sections: [
      {
        heading: "stdlib::math",
        code: `module easing;

use stdlib::math::{lerp, smoothstep, hypot2};

fn ease(a: Real, b: Real, t: Real) -> Real {
    lerp(a, b, smoothstep(t))
}

fn distance(dx: Real, dy: Real) -> Real {
    hypot2(dx, dy)
}`,
        explanation: [
          "use stdlib::math::{lerp, smoothstep, hypot2}; imports three functions. Call them by their plain names.",
          "math::lerp(...) does not parse: import the name, then call lerp(...).",
          "lerp and smoothstep are chain order 0, pure arithmetic. hypot2 uses sqrt.",
          "smoothstep(t) expects t already scaled to [0, 1].",
        ],
      },
      {
        heading: "stdlib::signal",
        code: `module tone;

use stdlib::signal::{wave_sine, biquad_step};

fn a440(t: Real) -> Real {
    wave_sine(t, 440.0, 0.5, 0.0)
}

fn filtered(x: Real, x1: Real, x2: Real, y1: Real, y2: Real) -> Real {
    biquad_step(x, x1, x2, y1, y2, 0.2, 0.4, 0.2, -0.3, 0.1)
}`,
        explanation: [
          "wave_sine(t, frequency, amplitude, phase), wave_cosine and wave_triangle generate test signals.",
          "biquad_step computes one sample of a Direct-Form-I biquad. You keep the history (x1, x2, y1, y2) and pass it back in.",
          "Also here: fir3, fir5, linear_to_db, db_to_linear, box_muller.",
        ],
      },
      {
        heading: "stdlib::control",
        code: `module motor;

use stdlib::control::{pid_anti_windup, rate_limit};

fn command(error: Real, integral: Real, derivative: Real, previous: Real) -> Real {
    let u = pid_anti_windup(error, integral, derivative, 2.5, 0.1, 0.05, 50.0, 1.0);
    rate_limit(u, previous, 0.05)
}`,
        explanation: [
          "pid_anti_windup(error, integral, derivative, Kp, Ki, Kd, i_limit, u_limit) clamps the integral term and the output.",
          "rate_limit(target, current, max_step) moves at most max_step per call.",
          "Also here: pid, lpf1, hpf1, complementary, saturate, dead_zone, slew, kalman1d_update, kalman1d_predict.",
        ],
      },
      {
        heading: "Compile them, and what they do not promise",
        code: `eml-compile easing.eml --target c -o easing.c
eml-compile tone.eml --target c -o tone.c
eml-compile motor.eml --target c -o motor.c`,
        explanation: [
          "The shipped stdlib carries no @verify contracts yet, so importing a function gives you no theorem.",
          "To get one, wrap the call in your own function with requires and ensures, add @verify, and check it with #print axioms (Level 1, Lesson 4).",
        ],
      },
    ],
    exercise:
      "Build a small synthesizer from stdlib functions: wave_sine for the "
      + "oscillator, biquad_step for the filter, and lerp for the envelope. "
      + "Compile to C. The output should be a function that takes (time, "
      + "note_frequency, envelope_position) and returns an audio sample.",
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
        </div>
      </div>
    </div>
  );
}

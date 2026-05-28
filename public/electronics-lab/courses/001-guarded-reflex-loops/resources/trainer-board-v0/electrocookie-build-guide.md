# Monogate Trainer Board v0: ElectroCookie Layout

Status: planned solder build; base board scope locked for the first ElectroCookie build.

This board is the reusable trainer/control panel for Reflex Lab 01 through the
Field Capsule project. It should prove the low-risk loop first:

```text
pot -> ESP32 -> EML kernel -> guard -> LED/buzzer -> dashboard/telemetry
```

The tutorial-facing behavior plan is in
`courses/001-guarded-reflex-loops/resources/trainer-board-v0/kernel-modes.md`. Treat this board as an EML
kernel exerciser: one physical board, multiple kernel modes, and the same
trace/replay/evidence habit every time.

For the first hands-on tutorial, use
`courses/001-guarded-reflex-loops/resources/trainer-board-v0/first-demo-runbook.md` before soldering.

Do not add coils, electromagnets, motors, or other high-current loads directly
to this first trainer board. Treat Trainer Board v0 as the signal/control hub.
Motor, BME280, and display labs should plug into it as add-on modules.

## Current ESP32 Target

New physical builds should use the ESP32 ESP-32S + GVS shield/mount represented
in the simulator. This is the board that just arrived for the bench build.
Older ESP32 DevKit notes remain useful for Arduino setup, but the physical
pin labels and jumper plan should follow the simulator board:

```text
D34 / GPIO34 -> potentiometer wiper
D25 / GPIO25 -> 330R -> LED anode
D26 / GPIO26 -> 110R -> buzzer +
3V3 -> trainer power rail
GND -> trainer ground rail
```

Only label the pins used by Trainer Board v0 on the build: D34, D25, D26, 3V3,
and GND. Leave the rest of the shield available for future modules.

## Board Assumption

The ElectroCookie board has two breadboard-style sections with columns `1-17`.

With the board oriented as described during planning:

```text
top section:     J I H G F    columns 1-17
center gap
bottom section:  E D C B A    columns 1-17
```

## Recommended Architecture

Use three cookie boards when available:

```text
Cookie A: ESP32 carrier / controller access
Cookie B: Monogate Trainer Board v0
Cookie C: portable power and expansion
```

If only two cookie boards are available, keep Cookie C as a future add-on.
Connect boards with short Dupont jumpers or a small labeled ribbon/header.

Keep future magnetic actuator or coil-driver hardware on a separate driver
module. The driver module can connect later through a reserved expansion
header, but it should not share this first trainer board.

## Cookie B Layout Convention

Use the top section for connectors and expansion:

```text
J-F side: headers / sensors / expansion
```

Use the bottom section for human controls and simple indicators:

```text
E-A side: button / potentiometer / LED / buzzer / test points
```

Suggested placement:

```text
Top section
J1-F4      ESP32 jumper header landing
J5-F8      I2C header block
J9-F12     OLED/BME280 plug area
J13-F17    reserved Field Capsule expansion header

Bottom section
E1-A4      3V3, GND, and test points
E5-A7      mode/run button
E8-A11     potentiometer
E12-A14    LED and resistor
E15-A17    buzzer output
```

Adjust exact holes after the physical board and parts are photographed.

## Base Board Versatility Plan

Trainer Board v0 should stay small and reusable. Populate the base board with:

```text
10K potentiometer input
330R LED output path
110R piezo buzzer output path
3V3/GND rails and test points
short labeled ESP32/GVS jumper header
reserved add-on headers
```

Then build later labs as add-ons:

```text
Motor add-on: D/PWM signal -> driver board -> fan/motor, separate load power
BME add-on: 3V3, GND, SDA, SCL to BME280 module
Display add-on: 3V3, GND, SDA, SCL to OLED/GM12864-style display module
Combined add-on: sensor + display + driver-protected output
```

The base board should expose signals cleanly, not carry every future load
directly.

## ESP32 Signal Plan

Use this as the first pin map unless the specific ESP32 board requires changes:

| Function | ESP32 pin | Notes |
| --- | --- | --- |
| 3V3 | 3V3 | Logic/sensor supply only |
| GND | GND | Shared logic ground |
| I2C SDA | GPIO21 | Reserved add-on header for BME/display |
| I2C SCL | GPIO22 | Reserved add-on header for BME/display |
| Potentiometer wiper | D34 / GPIO34 | ADC input, input-only pin |
| LED output | D25 / GPIO25 | Use 330 ohm series resistor |
| Buzzer output | D26 / GPIO26 | Route through 110 ohm series resistor to buzzer +; use a transistor driver if buzzer current is not tiny |
| Button input | GPIO27 | Reserved; use later with internal pullup |

## Headers To Build

ESP32 jumper header:

```text
3V3
GND
GPIO21 SDA
GPIO22 SCL
D34 / GPIO34 POT
D25 / GPIO25 LED
D26 / GPIO26 BUZZER
GPIO27 BUTTON
```

## Buzzer Output Path

The breadboard-tested buzzer path is:

```text
ESP32 D26 / GPIO26 -> 110 ohm resistor -> buzzer +
buzzer - -> shared GND rail
```

Use a 110 ohm resistor with color bands:

```text
brown - brown - black - black - brown
```

Do not connect the buzzer positive lead directly to GPIO26/D26 in the Trainer
Board v0 lab. Disconnect USB before adding or moving the buzzer path.

I2C sensor/display header:

```text
3V3
GND
SDA
SCL
```

Reserved Field Capsule header:

```text
GND
3V3
COIL_PWM_L
COIL_PWM_R
FIELD_SENSE
CURRENT_SENSE
```

The reserved Field Capsule header is a placeholder only. Do not wire it to a
coil driver until the magnetic actuator lessons, guards, and current limits are
implemented.

## First Build Checklist

Before soldering:

- breadboard the potentiometer, LED, and buzzer paths;
- leave BME280, display, and motor as add-on headers/modules for later labs;
- read `docs/bench-arrival-checklist.md`;
- read `docs/portable-power-plan.md`;
- run the Reflex Lab 01 EML and trace validators;
- label each ESP32 jumper;
- photograph the board and confirm exact hole placement.

After soldering:

- check continuity for 3V3 and GND;
- check that 3V3 is not shorted to GND;
- test LED output first;
- test potentiometer next;
- disconnect USB before adding/enabling buzzer;
- capture a short validation note in the lesson evidence folder.

## Safety Boundary

This trainer board is for low-voltage logic, indicators, and sensors.

Do not connect:

- electromagnets;
- solenoids;
- motors without driver boards;
- mains voltage;
- high-current loads;
- unknown buzzer modules that draw more than a tiny GPIO-safe current.

When in doubt, use the trainer board only as a signal/control source and put
the load on a separate driver module with its own power boundary.

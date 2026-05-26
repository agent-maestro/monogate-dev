# Monogate Trainer Board v0: ElectroCookie Layout

Status: planned solder build.

This board is the reusable trainer/control panel for Reflex Lab 01 through the
Field Capsule project. It should prove the low-risk loop first:

```text
pot/button -> ESP32 -> EML kernel -> guard -> LED/buzzer/OLED -> telemetry
```

The tutorial-facing behavior plan is in
`courses/001-guarded-reflex-loops/resources/trainer-board-v0/kernel-modes.md`. Treat this board as an EML
kernel exerciser: one physical board, multiple kernel modes, and the same
trace/replay/evidence habit every time.

For the first hands-on tutorial, use
`courses/001-guarded-reflex-loops/resources/trainer-board-v0/first-demo-runbook.md` before soldering.

Do not add coils, electromagnets, motors, or other high-current loads to this
first trainer board.

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

## ESP32 Signal Plan

Use this as the first pin map unless the specific ESP32 board requires changes:

| Function | ESP32 pin | Notes |
| --- | --- | --- |
| 3V3 | 3V3 | Logic/sensor supply only |
| GND | GND | Shared logic ground |
| I2C SDA | GPIO21 | BME280/OLED data |
| I2C SCL | GPIO22 | BME280/OLED clock |
| Potentiometer wiper | GPIO34 | ADC input, input-only pin |
| LED output | GPIO25 | Use 220 ohm or 330 ohm series resistor |
| Buzzer output | GPIO26 | Use a transistor driver if buzzer current is not tiny |
| Button input | GPIO27 | Use internal pullup; button closes to GND |

## Headers To Build

ESP32 jumper header:

```text
3V3
GND
GPIO21 SDA
GPIO22 SCL
GPIO34 POT
GPIO25 LED
GPIO26 BUZZER
GPIO27 BUTTON
```

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

- breadboard the LED, button, potentiometer, buzzer, BME280, and OLED;
- read `docs/bench-arrival-checklist.md`;
- read `docs/portable-power-plan.md`;
- confirm I2C device addresses;
- run the Reflex Lab 01 EML and trace validators;
- label each ESP32 jumper;
- photograph the board and confirm exact hole placement.

After soldering:

- check continuity for 3V3 and GND;
- check that 3V3 is not shorted to GND;
- test LED output first;
- test button and potentiometer next;
- test I2C devices before enabling buzzer;
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

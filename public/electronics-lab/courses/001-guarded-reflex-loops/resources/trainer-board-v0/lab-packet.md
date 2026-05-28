# Reflex Lab 01: Pot to Guarded LED

## Monogate Trainer Board v0 First Live Lab Demo Packet

### Threshold Reflex - Your First Verifiable EML Hardware Demo

**Status:** Built and tested on a breadboard; ready for your bench

**Current hardware target:** ESP32 ESP-32S on the GVS shield/mount shown in the simulator. Older ESP32 DevKit notes are still useful, but new physical builds should follow the simulator board labels: D34/POT, D25/LED, D26/BUZZ, 3V3, and GND.

**Goal:** Prove the full Monogate loop on real hardware in one fun session

## Welcome!

Hi! Welcome to **Reflex Lab 01**, your very first Monogate Trainer Board v0 lab.

Today you're going to build a tiny but powerful circuit that shows the real
magic of Monogate:

```text
One clean EML kernel -> makes a real safety-conscious decision -> lights an LED -> leaves a trace anyone can check
```

By the end you'll have:

- A working breadboard circuit
- Live EML-controlled behavior you can see and tweak
- A verifiable trace you can replay and share

Let's get started!

## Naming Map

| Layer | Name |
| --- | --- |
| Platform | Monogate Electronics |
| Track | Reflex Lab Series |
| Board | Trainer Board v0 |
| Course | Reflex Lab 01: Pot to Guarded LED |
| Kernel | `threshold_reflex_v0` |

## Learning Objectives

By the end of this lab you will be able to:

- Wire a safe ESP32 + potentiometer + LED circuit on a breadboard
- Understand how an EML kernel, `threshold_reflex_v0`, controls real hardware
- Capture and replay a live trace that proves the guard clamp worked
- Explain the Monogate way: input -> EML kernel -> guard decision -> visible output -> verifiable evidence

## Safety First

Please read this before wiring:

- Use only 3.3V, never 5V, for this demo
- Always use the 330 ohm resistor with the LED
- Never connect the potentiometer to 5V or VIN
- If anything gets warm, unplug immediately
- Add the buzzer only after the LED demo works and USB is disconnected
- Do not add motors, relays, or high-current parts to Trainer Board v0 without a separate driver module

## What You Need

Required for this first demo:

- ESP32 ESP-32S with GVS shield/mount, matching the simulator
- USB data cable, not just a power cable
- Breadboard
- Jumper wires, male-to-male
- 10 kOhm potentiometer
- One LED, any color
- 330 ohm resistor
- Piezo buzzer
- 110 ohm resistor for the buzzer path, color bands brown-brown-black-black-brown
- Laptop with power

Reserved add-ons for later demos, not needed on the base Trainer Board v0 build:

- Momentary button
- SSD1306 OLED
- BME280 sensor
- Motor plus driver board

## Board Role

Trainer Board v0 is the reusable control hub. This first populated build uses
the potentiometer, LED, and buzzer because they prove input, guarded output,
audible feedback, dashboard, and replay without leaving low-current logic.

Future labs should plug add-on modules into the same base board:

```text
Trainer Board v0 + motor driver/fan add-on
Trainer Board v0 + BME280 sensor add-on
Trainer Board v0 + BME280 + display add-on
```

Do not solder motors or high-current loads directly onto the base board. Keep
them on driver/protection modules that plug into the Trainer Board signal,
power, and ground headers.

## Software Prerequisites

Set these up before the bench build. Software issues are the easiest way for a
good wiring session to stall.

Required:

- This `monogate-electronics` folder
- Python 3.10 or newer
- A terminal:
  - Windows: PowerShell
  - macOS/Linux: Terminal
- Arduino IDE 2.x or Arduino CLI
- ESP32 board support installed in Arduino tooling
- A USB data cable, not a charge-only cable

Recommended:

- Git, if you plan to pull updates from the repo
- A text editor such as VS Code
- `just`, optional, for shortcut commands

Check Python:

```powershell
python --version
```

Expected:

```text
Python 3.10 or newer
```

If `python` is not found on Windows, try:

```powershell
py --version
```

For Arduino IDE, install ESP32 support:

1. Open Arduino IDE.
2. Go to `File` -> `Preferences`.
3. Add this to `Additional boards manager URLs`:

```text
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```

4. Go to `Tools` -> `Board` -> `Boards Manager`.
5. Search for `esp32`.
6. Install `esp32 by Espressif Systems`.

Before uploading firmware, confirm Arduino IDE can see your ESP32 port under:

```text
Tools -> Port
```

If no port appears, try another USB cable first. Many USB cables provide power
but do not carry data.

## Step 1: Computer Setup And Dry Run

Do this before you touch any wires. It proves everything works on your computer
first.

Open your terminal or PowerShell in the `monogate-electronics` folder.

Validate the EML kernel:

```powershell
python tools\validate_kernel_spec.py kernels\threshold_reflex_v0
```

Validate the golden trace:

```powershell
python tools\validate_trace.py kernels\threshold_reflex_v0\traces\golden_trace.jsonl
```

Replay the golden trace:

```powershell
python tools\replay_trace.py kernels\threshold_reflex_v0\traces\golden_trace.jsonl
```

You should see:

```text
Smoke check PASS
```

or:

```text
Trace validation: 7/7 valid
```

If anything fails, fix your Python setup before continuing.

## Step 2: Build The Circuit On Breadboard

### Quick Wiring Summary

For people who already know breadboards:

```text
ESP32 GND -> blue/- rail
ESP32 3V3 -> red/+ rail
Pot outer leg 1 -> red/+ rail
Pot middle/wiper -> ESP32 D34/GPIO34
Pot outer leg 2 -> blue/- rail
ESP32 D25/GPIO25 -> 330 ohm resistor -> LED long leg
LED short leg -> blue/- rail
```

Lab 01B adds the buzzer only after the LED reflex demo is working and USB is
disconnected:

```text
ESP32 D26/GPIO26 -> 110 ohm resistor -> buzzer + lead
Buzzer - lead -> blue/- rail
```

### Beginner Step-By-Step

#### 2A. Connect Power Rails

Wire:

```text
ESP32 GND pin -> breadboard blue/- rail
ESP32 3V3 pin -> breadboard red/+ rail
```

Check:

```text
Red rail = 3.3V
Blue rail = GND
Red rail and blue rail are not shorted together
```

#### 2B. Add The Potentiometer

Wire:

```text
Left outer leg -> red/+ rail
Middle leg/wiper -> ESP32 D34/GPIO34
Right outer leg -> blue/- rail
```

Check:

```text
Turning the knob should change voltage safely between 0V and 3.3V.
```

If the knob feels backwards later, swap the two outside legs. Do not move the
middle leg off GPIO34.

#### 2C. Add The LED And Resistor

Wire:

```text
ESP32 D25/GPIO25 -> one end of resistor
Other end of resistor -> LED long leg/anode
LED short leg/cathode -> blue/- rail
```

Final safety check before power:

- Resistor is between GPIO25 and LED
- Potentiometer is only on 3.3V, GND, and GPIO34
- Nothing is warm
- No extra parts are connected yet

Take a photo of your finished breadboard.

#### 2D. Optional Next Upgrade: Add The Buzzer

Do this only after the LED demo has run once. Disconnect USB before changing the
breadboard.

Wire:

```text
ESP32 D26/GPIO26 -> one end of 110 ohm resistor
Other end of 110 ohm resistor -> buzzer + lead
Buzzer - lead -> blue/- rail
```

The 110 ohm resistor color bands are:

```text
brown - brown - black - black - brown
```

Check:

- The buzzer positive lead is not connected directly to GPIO26/D26
- The 110 ohm resistor is in series between GPIO26/D26 and buzzer +
- The buzzer negative lead returns to the same GND rail as the ESP32

## Step 3: Upload The Firmware

The firmware file is already prepared for you:

```text
kernels/threshold_reflex_v0/esp32/threshold_reflex_v0/threshold_reflex_v0.ino
```

Choose one method.

### Option A: Arduino IDE

This is easiest for beginners.

1. Open the `.ino` file in Arduino IDE.
2. Select board:

```text
ESP32 Dev Module
```

3. Select the correct USB port.
4. Click Verify first.
5. Click Upload.
6. Hold the BOOT button on some ESP32 boards if upload fails.
7. Open Serial Monitor at:

```text
115200 baud
```

### Option B: Arduino CLI

Use this if `arduino-cli` is installed.

Compile:

```powershell
arduino-cli compile --fqbn esp32:esp32:esp32 kernels\threshold_reflex_v0\esp32\threshold_reflex_v0
```

Upload after checking the correct port:

```powershell
arduino-cli upload -p COM3 --fqbn esp32:esp32:esp32 kernels\threshold_reflex_v0\esp32\threshold_reflex_v0
```

Open serial:

```powershell
arduino-cli monitor -p COM3 -c baudrate=115200
```

Replace `COM3` with your actual ESP32 port.

## Step 4: Power Up And Run The Demo

Plug in the USB cable.

Open the Serial Monitor at `115200 baud`.

Slowly turn the potentiometer knob.

What you should see:

- When the knob is low, the LED is off or very dim
- As you turn through the threshold region, the LED gradually brightens
- When the math would ask for too much power, the guard clamp kicks in

This clamp is the star of the show. It is the EML kernel protecting the
hardware.

The first demo path is:

```text
potentiometer -> threshold_reflex_v0 -> guard clamp -> LED -> serial trace -> replay
```

## Step 5: Capture, Validate, And Replay Your Trace

When you're happy with the demo, copy the live JSON output from Serial Monitor
into a new file:

```text
evidence/trainer_board_v0/first_reflex_demo_YYYY_MM_DD/live_trace.jsonl
```

Validate it:

```powershell
python tools\validate_trace.py evidence\trainer_board_v0\first_reflex_demo_YYYY_MM_DD\live_trace.jsonl
```

Replay it:

```powershell
python tools\replay_trace.py evidence\trainer_board_v0\first_reflex_demo_YYYY_MM_DD\live_trace.jsonl
```

Watch the LED behavior again on your screen.

## Reflection And Evidence

Create a quick `FINDINGS.md` file in your evidence folder and answer:

- What did the guard clamp actually do?
- How did it feel different from normal Arduino code?
- What surprised you?

Save:

- One photo of your breadboard
- Your live trace file
- Validation output
- Replay output
- Any wiring notes

Run the packet manifest tool at the end:

```powershell
python tools\make_packet.py evidence\trainer_board_v0\first_reflex_demo_YYYY_MM_DD
```

## Troubleshooting

Stop immediately if:

- Anything gets warm
- ESP32 keeps resetting
- LED is wired without the resistor
- Potentiometer is connected to 5V
- You see smoke or notice strange smells

Unplug instantly if any stop condition appears.

## Glossary

| Term | What it means |
| --- | --- |
| ADC | Analog-to-Digital Converter. It turns knob voltage into a number. |
| GPIO | Programmable pin on the ESP32. |
| Wiper | Middle leg of the potentiometer. |
| Anode | Long leg of LED, positive side. |
| Cathode | Short leg of LED, ground side. |
| Guard clamp | The EML kernel's safety decision. |

## You Did It!

You just ran real EML math on physical hardware and proved it with a verifiable
trace.

This is the Monogate way.

Next steps, when you're ready:

- Pair this base board with a motor-driver add-on
- Pair this base board with a BME280 sensor add-on
- Pair this base board with BME280 plus a display add-on
- Try other EML kernels
- Move to a soldered Trainer Board once the breadboard layout is checked

Drop your findings, photos, or questions in the Monogate group. I would love to
see your demo.

## Bench Notes

Use this page while building:

```text
Date:

Builder:

ESP32 board type:

Any changes you made:


Photos taken:


Trace file saved as:

```

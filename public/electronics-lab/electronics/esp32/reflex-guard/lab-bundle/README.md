# Reflex Lab 01 Local Lab Bundle

This folder is the learner-facing hardware dashboard launcher for Reflex Lab 01.

The web course and simulator run in the browser. The physical ESP32 dashboard
needs a local helper because it reads the board's serial port.

## Quick Start

Use Chrome or Edge for the dashboard path.

### Windows

1. Plug in the ESP32 with a data-capable USB cable.
2. Double-click `MonogateDashboard.exe` if it is present.
3. If you do not see the exe, double-click `start-reflex-dashboard.bat`.
4. Wait for the browser to open:

```text
http://127.0.0.1:5191/live-board
```

The dashboard scans for the ESP32 automatically. If Windows is still assigning
the USB port, wait about 5 seconds and click `Scan Again`.

### Mac

The one-click launcher is Windows-only in this release. On Mac, run the same
dashboard directly from Terminal:

```bash
python3 -m pip install pyserial
python3 electronics/dashboards/esp32-arduino/dashboard.py
```

The dashboard will try to auto-detect common ESP32 serial adapters. If needed,
advanced users can still pass a specific port such as
`--port /dev/cu.usbserial-0001 --baud 115200`.

Then open Chrome or Edge:

```text
http://127.0.0.1:5191/live-board
```

Mac instructions follow the standard ESP32/macOS workflow and are pending a
Monogate bench-verified Mac run.

## Optional Port Override

From PowerShell:

```powershell
$env:MG_SERIAL_PORT = "COM7"
.\courses\001-guarded-reflex-loops\lab-bundle\start-reflex-dashboard.ps1
```

Optional baud override:

```powershell
$env:MG_SERIAL_BAUD = "115200"
```

## What This Starts

The launcher starts:

```powershell
MonogateDashboard.exe
```

If the exe is not present, the launcher falls back to:

```powershell
python dashboards\esp32-arduino\dashboard.py --port auto --baud 115200
```

Then it opens the live serial dashboard.

On Mac, the manual `python3 ... dashboard.py` command starts the same dashboard.

## Evidence Outputs

From the dashboard, export:

- JSONL trace;
- replay HTML;
- graph PNG or screenshot;
- evidence packet starter.

Those outputs become part of the course evidence packet.

## Boundary

This is a local lab helper, not cloud software. It does not upload serial data
or certify hardware behavior.

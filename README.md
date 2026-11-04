# Vision OPH KMUTT 2026

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Windows x64](https://img.shields.io/badge/Platform-Windows_10%2F11_x64-0078D6.svg)](https://github.com/newton1306/Vision_OPH_KMUTT2026/releases)
[![Offline: 100% Zero-CDN](https://img.shields.io/badge/Offline-100%25_Zero--CDN-green.svg)](scripts/verify_files.js)
[![Release: v2.0.0](https://img.shields.io/badge/Release-v2.0.0-orange.svg)](https://github.com/newton1306/Vision_OPH_KMUTT2026/releases/tag/v2.0.0)

---

## 1. System Overview

**Vision Workshop Suite** is an offline Computer Vision educational platform and motion-controlled gaming application developed for **KMUTT Open House (OPH 2026)**.

The suite integrates two core interactive modules into a unified, secure kiosk environment:

- **Computer Vision Mini Workshop:** An interactive visual block programming environment built with Google Blockly and Google MediaPipe Hands. Students write logic to detect hand landmarks, track upright finger states, attach AR visual effects, log coordinate trajectories, and classify geometric shapes in real time.
- **Fruit Neptune (Motion AR Slicing):** A full 3D motion-controlled recreation of the classic arcade fruit slicing game running on Three.js, tracking fingertip velocity vectors to generate luminous blade trails and handle real-time fruit slicing physics.

The suite launches through an interactive **Kiosk Portal** featuring dynamic background depth blur and high-tech tactical selection modules, guarded by strict kiosk lockdown policies to prevent accidental desktop exposure during live exhibition events.

> [!NOTE]
> **Zero-CDN Offline Architecture**  
> All MediaPipe WebAssembly binaries, TFLite neural network models, Blockly libraries, Three.js modules, audio synthesizers, and graphic assets are pre-packaged locally. The entire suite operates without network access.

---

## 2. Quick Start & Execution Options

Choose the deployment method that fits your environment:

### Option A: Prebuilt Windows Installer (Recommended)
Best for classroom laptops, event staff, and instructors.

1. Download the prebuilt installer (`CV.Workshop.Suite.Setup.2.0.0.exe`) from [GitHub Releases](https://github.com/newton1306/Vision_OPH_KMUTT2026/releases/tag/v2.0.0).
2. Run the setup wizard.
3. The installer creates a single unified shortcut on the Desktop and Start Menu:
   - **CV Workshop Suite** (launches directly into the fullscreen Kiosk Portal)

---

### Option B: Standalone Portable Package (Zero Installation)
Best for computers with restricted administrative privileges or running from a USB drive.

1. Download the portable zip archive (`CV-Workshop-Suite-2.0.0-win-x64-portable.zip`) from [GitHub Releases](https://github.com/newton1306/Vision_OPH_KMUTT2026/releases/tag/v2.0.0).
2. Extract the archive to any target folder.
3. Launch directly using either:
   - `CV Workshop Suite.exe` -> Launches the main portal window in kiosk mode
   - `Launch Vision Suite.bat` -> Unified one-click runner

---

### Option C: Run from Source Code (One-Click Setup)
Best for contributors and developers extending the suite.

#### Prerequisites
- Operating System: Windows 10 / 11 (64-bit)
- Hardware: Standard USB or integrated webcam
- Runtime: [Node.js](https://nodejs.org/) (LTS v20+ recommended)

#### Execution Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/newton1306/Vision_OPH_KMUTT2026.git
   cd Vision_OPH_KMUTT2026
   ```
2. Double-click the single launcher script at the project root:
   - `Launch_Vision_Suite.bat`
   Or run:
   ```bash
   npm start
   ```

> [!TIP]
> **Automated Dependency Setup**  
> On the first execution, `Launch_Vision_Suite.bat` automatically detects whether `node_modules` exists and runs `npm install` before starting the application.

---

## 3. Instructor Curriculum & Workshop Schedule

The workshop is designed as an intensive 30-minute interactive session structured into 6 sequential stages:

### Workshop Schedule (30 Minutes Total)

| Duration | Session Topic | Activity Description |
| :--- | :--- | :--- |
| **5 mins** | **First Game (Fruit Neptune)** | Hands-on optical motion slicing test on screen to establish immediate engagement and camera familiarity. |
| **5 mins** | **Lecture + Demo** | Introduction to fundamental Computer Vision concepts and visual block command workflows. |
| **5 mins** | **Challenge A: Animation & FX** | Attach dynamic visual effects and animations tracked to hand landmarks and fingertips. |
| **5 mins** | **Challenge B: Detect Fingers** | Detect hand orientation, count upright fingers (1 to 5), and render numerical feedback on the HUD. |
| **5 mins** | **Challenge C: Draw a Shape** | Mid-air geometric shape drawing with pinch gestures and test real-time AI shape classification. |
| **5 mins** | **Wrap Up** | Real-world applications in industry (AI / Game Development) and reward distribution. |

### Progressive Challenge Specifications

Each challenge uses a **Dynamic Toolbox** that exposes only the blocks relevant to the active challenge, preventing cognitive overload and cross-session misuse:

| Challenge | Objective | Core Learning Concepts | Key Gestures & Blocks |
| :--- | :--- | :--- | :--- |
| **Challenge A: Animation & AR Attachment** | Detect hand orientation and attach visual FX sprites (Iron Man Arc Repulsor, Mystic Arts Mandala, Chakra Rasengan) to palm and finger landmarks. | Conditional branching (`if`), landmark binding (`attach to Palm/Index`), real-time sprite transformation. | Open palm, finger positions, `ai_sensor`, `ai_attach_sprite`, `ai_print_text`. |
| **Challenge B: Finger Detection & Counting** | Read the number of upright fingers in real time (1 to 5) and render dynamic numeric feedback on the camera HUD. | Sensor data polling, numeric condition evaluation (`fingers == 1..5`), dynamic text feedback. | Upright finger counting (1-5 fingers), `ai_sensor`, `ai_print_text`. |
| **Challenge C: Draw a Shape & AI Recognition** | Draw geometric shapes (Circle, Triangle, Square) in mid-air using fingertip gestures, then classify the drawn shapes using AI vision recognition. | Trajectory logging, coordinate point buffers, shape classification heuristics. | Pinch (Thumb + Index) to draw, `ai_draw_trail`, `ai_sensor`, `ai_shape_value`, `ai_print_text`. |

---

## 4. Kiosk Security & Administrative Controls

To ensure an uninterrupted experience during open house exhibitions, the suite implements strict kiosk lockdown policies:

- **Window Protection:** Standard exit mechanisms (`Alt + F4`, `Ctrl + W`, `Ctrl + Q`, `F11`, `Win`, `Win + D`, `Tab`) are intercepted and blocked by the low-level OS hook and application shell.
- **Single Point of Exit (`Alt + C`):** The only authorized way to close the application is the supervisor shortcut `Alt + C`. This shortcut operates reliably across both English (`KeyC`) and Thai (`KeyC` / Thai character mappings) keyboard layouts.
- **Presenter Slide Toggle (`Alt + S`):** Seamlessly toggles between presentation slides (in Browser) and the Kiosk DEMO suite without invoking the Windows Alt+Tab task switcher UI or exposing window close controls. Supports English and Thai keyboards.
- **Instructor Solution Injection (`Alt + A`):** Inserts the complete, verified solution for the active challenge into the workspace. Operates silently without notifications or sounds, and is automatically suppressed while typing in input fields.
- **Workshop Session Reset (`Alt + V`):** Clears the CV Workshop workspace, resets drawings and sensor state, and prepares a fresh session for the next student. Operates across English and Thai keyboard layouts.
- **Session Hard Reset (`Ctrl + R`):** Reinitializes the active window and restores initial session state when needed.

| Key Combination | Function | Description |
| :--- | :--- | :--- |
| **`Alt + C`** | **Authorized Supervisor Exit** | Immediately closes the application and releases system resources. Supports English and Thai keyboards. |
| **`Alt + S`** | **Presenter Slide Toggle** | Seamlessly alternates between presentation slides in the browser and the kiosk suite without showing the Alt+Tab interface. |
| **`Alt + V`** | **Workshop Session Reset** | Clears the CV Workshop workspace, resets drawings, and loads a fresh session for the next student. |
| **`Alt + A`** | **Secret Solution Injection** | Silently inserts the complete solution blocks for the active challenge (Challenge A, B, or C). |
| **`Ctrl + R`** | **Hard Reset** | Reinitializes the active window and clears current session state. |

---

## 5. Fruit Neptune (Motion AR Slicing)

A standalone 3D motion-tracking game designed as an interactive showcase of optical computer vision capabilities:

- **Physics & Motion Engine:** Analyzes real-time 3D velocity vectors of the user's index fingertip to generate dynamic blade trails and evaluate collision planes with launched fruit meshes.
- **Streamlined Navigation:** Features a clean top navigation bar with a dedicated Main Menu button to return to the Kiosk Portal at any time.
- **Available Game Modes:**
  - **Classic Mode:** Traditional 3 Strikes system featuring surprise bombs and slice-to-start watermelon entry.
  - **Zen Mode:** 90-second score-attack mode with continuous fruit spawns and zero bombs.
  - **Blade Master Mode:** High-velocity challenge mode testing reflex speed and hand accuracy.

---

## 6. Technical Stack & Offline Architecture

- **Application Shell:** Electron 44 (Node.js runtime + Chromium browser engine)
- **Vision Pipeline:** Google MediaPipe Hands (Local WebAssembly and TFLite neural model)
- **Block Programming:** Google Blockly 13.3 (Custom MakeCode palette, dark theme, and JavaScript generator)
- **3D Graphics:** Three.js 0.186 (Custom vertex shaders, geometric extrusions, and particle emitters)
- **Audio System:** Web Audio API (Algorithmic frequency synthesizers and bundled local sound buffers)
- **Packaging:** electron-builder 26 with custom NSIS installer script (`build/installer.nsh`)

---

## 7. Project Directory Structure

```text
Vision_OPH_KMUTT2026/
|-- Launch_Vision_Suite.bat     # One-click unified launcher for Vision Suite
|-- package.json               # Project manifest, dependencies, and build config
|-- LICENSE                    # MIT Open Source License
|-- README.md                  # Project documentation
|-- build/
|   |-- installer.nsh          # NSIS installer single-shortcut script
|   |-- icon.ico               # Application window icon
|   |-- fruit_ninja.ico        # Fruit Ninja icon
|   `-- cv_workshop.ico        # CV Workshop icon
|-- image_source/
|   `-- CV BG.png              # High-resolution kiosk portal backdrop image
|-- src/
|   |-- main/                  # Electron main process & IPC handlers
|   |-- menu/                  # Kiosk portal main menu, dynamic blur & mecha HUD
|   |-- cv_workshop/           # Blockly workspace, custom blocks, and vision HUD
|   |-- fruit_ninja/           # Fruit Neptune 3D game logic, physics, and rendering
|   `-- shared/                # MediaPipe offline WASM/models, audio synth, sprites
`-- scripts/
    `-- verify_files.js        # Offline asset integrity and syntax verification
```

---

## 8. License & Attribution

This project is licensed under the terms of the [MIT License](LICENSE).
Feel free to use, modify, and build upon this suite for educational and non-commercial workshops.

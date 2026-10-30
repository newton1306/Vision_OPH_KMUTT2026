# Vision OPH KMUTT 2026

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform: Windows x64](https://img.shields.io/badge/Platform-Windows_10%2F11_x64-0078D6.svg)](https://github.com/newton1306/Vision_OPH_KMUTT2026/releases)
[![Offline: 100% Zero-CDN](https://img.shields.io/badge/Offline-100%25_Zero--CDN-green.svg)](scripts/verify_files.js)
[![Release: v1.0.2](https://img.shields.io/badge/Release-v1.0.2-orange.svg)](https://github.com/newton1306/Vision_OPH_KMUTT2026/releases/tag/v1.0.2)

---

## 1. System Overview

**Vision Workshop Suite** is an offline Computer Vision educational platform and motion-controlled gaming application developed for **KMUTT Open House (OPH 2026)**.

The suite is comprised of two core applications:

- **Computer Vision Mini Workshop:** An interactive visual block programming environment built with Google Blockly and Google MediaPipe Hands. Students write logic to detect hand landmarks, track upright finger states, log coordinate trajectories, and classify geometric shapes in real time.
- **Fruit Ninja Motion Edition:** A full 3D motion-controlled recreation of the arcade game running on Three.js, tracking fingertip velocity vectors to generate luminous blade trails and handle real-time fruit slicing physics.

> [!NOTE]
> **Zero-CDN Offline Architecture**  
> All MediaPipe WebAssembly binaries, TFLite neural network models, Blockly libraries, Three.js modules, audio synthesizers, and graphic assets are pre-packaged locally. The entire suite operates without network access.

---

## 2. Quick Start & Execution Options

Choose the deployment method that fits your environment:

### Option A: Prebuilt Windows Installer (Recommended)
Best for classroom laptops, event staff, and instructors.

1. Download **`CV.Workshop.Suite.Setup.1.0.2.exe`** from the [GitHub Releases page](https://github.com/newton1306/Vision_OPH_KMUTT2026/releases/tag/v1.0.2).
2. Run the setup wizard.
3. The installer creates two separate shortcuts on the Desktop and Start Menu:
   - **CV Workshop** (launches directly into the visual programming workshop)
   - **Fruit Ninja** (launches directly into the 3D motion game)

---

### Option B: Standalone Portable Package (Zero Installation)
Best for computers with restricted administrative privileges or running from a USB drive.

1. Download **`CV-Workshop-Suite-1.0.2-win-x64-portable.zip`** from [GitHub Releases](https://github.com/newton1306/Vision_OPH_KMUTT2026/releases/tag/v1.0.2).
2. Extract the archive to any target folder.
3. Launch directly using dedicated batch launchers:
   - `Launch CV Workshop.bat` -> Launches CV Workshop
   - `Launch Fruit Ninja.bat` -> Launches Fruit Ninja
   - `CV Workshop Suite.exe` -> Launches the main launcher window

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
2. Double-click either launcher script at the project root:
   - `Launch_CV_Workshop.bat`
   - `Launch_Fruit_Ninja.bat`

> [!TIP]
> **Automated Dependency Setup**  
> On the first execution, the launcher automatically detects whether `node_modules` exists and runs `npm install` before starting the application.

---

## 3. Instructor Curriculum: CV Workshop Challenges

The workshop features three progressive challenges. Each challenge uses a **Dynamic Toolbox** that exposes only the blocks relevant to the active challenge, preventing cognitive overload and cross-session misuse:

| Challenge | Objective | Core Learning Concepts | Key Gestures & Blocks |
| :--- | :--- | :--- | :--- |
| **Challenge 1: Iron Man Palm Repulsor** | Detect when all 5 fingers are spread wide. Attach the glowing Repulsor beam sprite to the palm center and trigger audio effects. | Conditional branching (`if`), sensor comparison (`fingers == 5`), sprite binding, sound synthesis. | Open palm (5 fingers), `ai_sensor`, `ai_attach_sprite`, `ai_play_sound`. |
| **Challenge 2: Finger Counter** | Read the number of upright fingers in real time and render dynamic numeric feedback on the camera HUD. | Sensor data polling, string concatenation (`text_join`), dynamic overlay typography. | Upright finger counting (1-5 fingers), `ai_print_text`. |
| **Challenge 3: Draw & Detect** | Draw geometric shapes (Circle, Triangle, Square) in mid-air using hand gestures, then submit for shape classification. | Trajectory logging, coordinate buffers, gesture toggles, shape classification heuristics. | **Pinch (Thumb + Index)** to draw, **Raise 2 hands** to clear canvas, `ai_draw_trail`, `ai_shape_value`. |

---

## 4. Instructor & Staff Administrative Controls

The suite includes hidden hotkeys for instructors to manage live classroom sessions smoothly:

| Key Combination | Function | Description |
| :--- | :--- | :--- |
| **`Alt + A`** | **Secret Solution Injection** | Silently inserts the complete, verified solution for the active challenge into the workspace. Operates without sound effects, notifications, or toasts. Automatically suppressed while typing inside input fields. |
| **`F11`** | **Toggle Fullscreen** | Switches between windowed and borderless fullscreen display. |
| **`Ctrl + R`** | **Hard Reset** | Reinitializes the Electron window and clears current session state. |

---

## 5. Fruit Ninja 3D Motion Edition

A standalone 3D motion-tracking game designed as an interactive showcase of optical computer vision capabilities:

- **Physics & Motion Engine:** Analyzes real-time 3D velocity vectors of the user's index fingertip to generate dynamic blade trails and evaluate collision planes with launched fruit meshes.
- **Available Game Modes:**
  - **Classic Mode:** Traditional 3 Strikes (Hearts) system featuring surprise bombs and slice-to-start watermelon entry.
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
|-- Launch_CV_Workshop.bat     # One-click launcher for CV Workshop
|-- Launch_Fruit_Ninja.bat     # One-click launcher for Fruit Ninja
|-- package.json               # Project manifest, dependencies, and build config
|-- LICENSE                    # MIT Open Source License
|-- README.md                  # Project documentation
|-- build/
|   |-- installer.nsh          # NSIS installer dual-shortcut script
|   |-- icon.ico               # Application window icon
|   |-- fruit_ninja.ico        # Fruit Ninja desktop shortcut icon
|   `-- cv_workshop.ico        # CV Workshop desktop shortcut icon
|-- src/
|   |-- main/                  # Electron main process & IPC handlers
|   |-- cv_workshop/           # Blockly workspace, custom blocks, and vision HUD
|   |-- fruit_ninja/           # Fruit Ninja 3D game logic, physics, and rendering
|   `-- shared/                # MediaPipe offline WASM/models, audio synth, sprites
`-- scripts/
    `-- verify_files.js        # Offline asset integrity and syntax verification
```

---

## 8. License & Attribution

This project is licensed under the terms of the [MIT License](LICENSE).
Feel free to use, modify, and build upon this suite for educational and non-commercial workshops.

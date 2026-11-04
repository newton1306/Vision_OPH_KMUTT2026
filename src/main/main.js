const { app, BrowserWindow, ipcMain, session, globalShortcut, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow = null;
let isAllowQuit = false;
let isPresenterSwitched = false;
let guardProcess = null;

function togglePresenterMode() {
  if (!mainWindow) return;

  isPresenterSwitched = !isPresenterSwitched;

  if (isPresenterSwitched) {
    console.log('[PRESENTER] Switching to Browser / Slides mode...');
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setKiosk(false);
    mainWindow.minimize();
  } else {
    console.log('[PRESENTER] Returning to Kiosk DEMO mode...');
    mainWindow.restore();
    mainWindow.setKiosk(true);
    mainWindow.setFullScreen(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    mainWindow.focus();
  }
}

function startKioskGuard() {
  if (process.platform !== 'win32') return;

  const guardPath = path.join(__dirname, 'kiosk-guard.exe');
  if (fs.existsSync(guardPath)) {
    try {
      guardProcess = spawn(guardPath, [process.pid.toString()], {
        detached: false,
        stdio: 'ignore',
        windowsHide: true
      });

      guardProcess.on('error', (err) => {
        console.warn('[SECURITY] Failed to spawn kiosk-guard:', err.message);
      });

      console.log('[SECURITY] Low-level OS kiosk guard active (PID:', guardProcess.pid, ')');
    } catch (e) {
      console.warn('[SECURITY] Kiosk guard launch exception:', e.message);
    }
  } else {
    console.warn('[SECURITY] kiosk-guard.exe not found at', guardPath);
  }
}

function stopKioskGuard() {
  if (guardProcess) {
    try {
      guardProcess.kill();
    } catch (_) {}
    guardProcess = null;
  }
}

// Determine target app from command line arguments
// e.g. --app=fruit-ninja, --app=cv-workshop, or --app=menu (default)
function getTargetApp() {
  const arg = process.argv.find(a => a.startsWith('--app='));
  if (arg) {
    return arg.split('=')[1].trim().toLowerCase();
  }
  // Default to main interactive kiosk menu
  return 'menu';
}

function terminateApp() {
  console.log('[SECURITY] Force terminating application immediately via Alt+C...');
  isAllowQuit = true;
  stopKioskGuard();
  try {
    globalShortcut.unregisterAll();
  } catch (e) {}
  if (mainWindow) {
    try {
      mainWindow.destroy();
    } catch (e) {}
    mainWindow = null;
  }
  app.exit(0);
}

function createWindow() {
  const targetApp = getTargetApp();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.bounds;

  // Automatically approve camera & media permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media' || permission === 'camera') {
      callback(true);
      return;
    }
    callback(false);
  });

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: width,
    height: height,
    fullscreen: true,
    kiosk: true,              // Kiosk mode
    alwaysOnTop: true,        // Keep on top of other windows
    skipTaskbar: false,       // Shows on taskbar alongside Browser as requested
    closable: false,          // Disables close button in OS / taskbar previews
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#070a13',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: false, // Allows simple direct communication in unpacked HTML/JS for workshop instructors
      webSecurity: false,      // Allows local file fetching of wasm and data models
      allowRunningInsecureContent: true
    },
    title: 'Vision OPH KMUTT 2026'
  });

  // Force window to exact display bounds and ensure true fullscreen kiosk
  mainWindow.setBounds({ x: 0, y: 0, width: width, height: height });
  mainWindow.setFullScreen(true);
  mainWindow.setKiosk(true);

  // Start low-level OS keyboard guard (blocks Windows Key, Alt+Tab, Tab, Ctrl+Esc)
  startKioskGuard();

  // Pin window at highest system z-order level ('screen-saver')
  try {
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    mainWindow.setVisibleOnAllWorkspaces(true);
  } catch (err) {
    console.warn('[SECURITY] Could not set screen-saver priority:', err);
  }

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[RENDERER ${level}] ${message} (${sourceId}:${line})`);
  });

  // Strict Kiosk Protection: prevent accidental close unless isAllowQuit is set
  mainWindow.on('close', (e) => {
    if (!isAllowQuit) {
      e.preventDefault();
      console.log('[SECURITY] Window close attempt prevented. Strictly Alt+C only.');
    }
  });

  // Prevent minimizing unless in presenter mode (e.g. via Win+D or Win+M)
  mainWindow.on('minimize', (e) => {
    if (!isPresenterSwitched) {
      e.preventDefault();
      mainWindow.restore();
      mainWindow.setKiosk(true);
      mainWindow.setFullScreen(true);
      mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
      mainWindow.focus();
    }
  });

  // When restored from taskbar or shortcut, immediately re-engage full kiosk mode
  mainWindow.on('restore', () => {
    if (isPresenterSwitched) {
      isPresenterSwitched = false;
      mainWindow.setKiosk(true);
      mainWindow.setFullScreen(true);
      mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
      mainWindow.focus();
    }
  });

  // Regain focus immediately if user presses Windows Key or clicks outside (while not in presenter mode)
  mainWindow.on('blur', () => {
    if (!isAllowQuit && !isPresenterSwitched && mainWindow) {
      setImmediate(() => {
        if (mainWindow && !isAllowQuit && !isPresenterSwitched) {
          mainWindow.focus();
          mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
        }
      });
    }
  });

  // Intercept and swallow all escape / toggle / dev keystrokes before they reach renderer
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Check Alt + C (support physical KeyC, uppercase, lowercase, and Thai layout 'แ' / 'ฉ')
    const isKeyC = (
      input.code === 'KeyC' || 
      (input.key && input.key.toLowerCase() === 'c') ||
      input.key === 'แ' ||
      input.key === 'ฉ'
    );

    if (input.alt && isKeyC) {
      event.preventDefault();
      terminateApp();
      return;
    }

    // Allow Alt+A for admin solution spawn in CV workshop (support English and Thai layout)
    const isKeyA = (
      input.code === 'KeyA' || 
      (input.key && input.key.toLowerCase() === 'a') ||
      input.key === 'ฟ' ||
      input.key === 'ฤ'
    );
    if (input.alt && isKeyA) {
      return; // Let Alt+A pass to renderer
    }

    // Allow Alt+V for CV workshop reset (support English and Thai layout)
    const isKeyV = (
      input.code === 'KeyV' || 
      (input.key && input.key.toLowerCase() === 'v') ||
      input.key === 'อ' ||
      input.key === 'ฮ'
    );
    if (input.alt && isKeyV) {
      return; // Let Alt+V pass to renderer
    }

    // Allow Alt+S for presenter slide toggle (support English and Thai layout)
    const isKeyS = (
      input.code === 'KeyS' || 
      (input.key && input.key.toLowerCase() === 's') ||
      input.key === 'ห' ||
      input.key === 'ฆ'
    );
    if (input.alt && isKeyS) {
      event.preventDefault();
      togglePresenterMode();
      return;
    }

    // Block Tab key entirely (plain Tab, Shift+Tab, Ctrl+Tab, Alt+Tab)
    if (input.key === 'Tab' || input.code === 'Tab') {
      event.preventDefault();
      return;
    }

    // Block Windows Key (Meta, OS, Super, Win+...)
    if (input.meta || input.key === 'Meta' || input.code === 'MetaLeft' || input.code === 'MetaRight' || input.key === 'OS') {
      event.preventDefault();
      return;
    }

    // Block F11 (Fullscreen toggle)
    if (input.key === 'F11' || input.code === 'F11') {
      event.preventDefault();
      return;
    }

    // Block F12, DevTools (Ctrl+Shift+I), Reload (Ctrl+R / F5)
    if (input.key === 'F12' || input.code === 'F12' || 
        input.key === 'F5' || input.code === 'F5' ||
        (input.control && input.shift && (input.key.toLowerCase() === 'i' || input.code === 'KeyI')) ||
        (input.control && (input.key.toLowerCase() === 'r' || input.code === 'KeyR'))) {
      event.preventDefault();
      return;
    }

    // Block Alt+F4, Alt+Space, Alt+Tab
    if (input.alt && (input.key === 'F4' || input.code === 'F4' || input.key === ' ' || input.code === 'Space' || input.key === 'Tab' || input.code === 'Tab')) {
      event.preventDefault();
      return;
    }
  });

  if (targetApp === 'fruit-ninja') {
    mainWindow.loadFile(path.join(__dirname, '../fruit_ninja/index.html'));
  } else if (targetApp === 'cv-workshop') {
    mainWindow.loadFile(path.join(__dirname, '../cv_workshop/index.html'));
  } else {
    mainWindow.loadFile(path.join(__dirname, '../menu/index.html'));
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.on('app:toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setKiosk(true);
    mainWindow.setFullScreen(true);
  }
});

ipcMain.on('app:reload', () => {
  if (mainWindow) {
    mainWindow.reload();
  }
});

// Both quit and force-quit trigger immediate termination
ipcMain.on('app:quit', () => {
  terminateApp();
});

ipcMain.on('app:force-quit', () => {
  terminateApp();
});

ipcMain.on('app:toggle-presenter', () => {
  togglePresenterMode();
});

ipcMain.on('app:switch-mode', (event, appName) => {
  if (!mainWindow) return;
  mainWindow.setKiosk(true);
  mainWindow.setFullScreen(true);
  mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  if (appName === 'fruit-ninja') {
    mainWindow.loadFile(path.join(__dirname, '../fruit_ninja/index.html'));
  } else if (appName === 'cv-workshop') {
    mainWindow.loadFile(path.join(__dirname, '../cv_workshop/index.html'));
  } else {
    mainWindow.loadFile(path.join(__dirname, '../menu/index.html'));
  }
});

app.whenReady().then(() => {
  createWindow();

  // Global Admin Shortcut: Alt+C strictly exits the kiosk
  try {
    globalShortcut.register('Alt+C', () => {
      terminateApp();
    });
  } catch (err) {
    console.error('[SECURITY] Failed to register Alt+C global shortcut:', err);
  }

  // Global Presenter Shortcut: Alt+S toggles between Slide Browser and Kiosk DEMO
  try {
    globalShortcut.register('Alt+S', () => {
      togglePresenterMode();
    });
  } catch (err) {
    console.error('[SECURITY] Failed to register Alt+S global shortcut:', err);
  }

  // Trap system keys globally to prevent bypassing kiosk mode
  const trapKeys = [
    'F11',
    'F12',
    'CommandOrControl+R',
    'CommandOrControl+Shift+R',
    'F5',
    'CommandOrControl+Shift+I'
  ];
  trapKeys.forEach(key => {
    try {
      globalShortcut.register(key, () => {
        // Silently swallow key
      });
    } catch (e) {}
  });

  if (process.argv.includes('--test-smoke')) {
    console.log('[SMOKE TEST] Electron window created and initialized successfully!');
    setTimeout(() => {
      terminateApp();
    }, 1500);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  stopKioskGuard();
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    terminateApp();
  }
});

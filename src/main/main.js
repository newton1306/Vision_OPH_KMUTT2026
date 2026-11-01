const { app, BrowserWindow, ipcMain, session, globalShortcut } = require('electron');
const path = require('path');

let mainWindow = null;
let isAllowQuit = false;

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

function createWindow() {
  const targetApp = getTargetApp();

  // Automatically approve camera & media permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media' || permission === 'camera') {
      callback(true);
      return;
    }
    callback(false);
  });

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    fullscreen: true,
    kiosk: true,              // Hardware kiosk mode: blocks OS chrome, F11, and taskbar
    alwaysOnTop: true,        // Keeps window pinned above all other windows
    skipTaskbar: true,        // Prevents taskbar thumbnailing and Win+D minimize
    minimizable: false,       // Forbids minimizing by OS commands
    closable: false,          // Forbids OS close buttons
    resizable: false,         // Forbids resizing
    movable: false,           // Forbids moving window
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

  // Strict Kiosk Protection: prevent accidental close via Alt+F4 / taskbar / scripts
  mainWindow.on('close', (e) => {
    if (!isAllowQuit) {
      e.preventDefault();
      console.log('[SECURITY] Window close attempt prevented. Strictly Alt+B only.');
    }
  });

  // Prevent minimizing (e.g. via Win+D or Win+M)
  mainWindow.on('minimize', (e) => {
    e.preventDefault();
    mainWindow.restore();
    mainWindow.setKiosk(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    mainWindow.focus();
  });

  // Regain focus immediately if user presses Windows Key or clicks outside
  mainWindow.on('blur', () => {
    if (!isAllowQuit && mainWindow) {
      setImmediate(() => {
        if (mainWindow && !isAllowQuit) {
          mainWindow.focus();
          mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
        }
      });
    }
  });

  // Intercept and swallow all escape / toggle / dev keystrokes before they reach renderer
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Allow Alt+B for admin quit
    if (input.alt && (input.key.toLowerCase() === 'b' || input.code === 'KeyB')) {
      return;
    }

    // Allow Alt+A for admin solution spawn in CV workshop
    if (input.alt && (input.key.toLowerCase() === 'a' || input.code === 'KeyA')) {
      return;
    }

    // Block F11 (Fullscreen toggle)
    if (input.key === 'F11') {
      event.preventDefault();
      return;
    }

    // Block F12, DevTools (Ctrl+Shift+I), Reload (Ctrl+R / F5)
    if (input.key === 'F12' || input.key === 'F5' || 
        (input.control && input.shift && input.key.toLowerCase() === 'i') ||
        (input.control && input.key.toLowerCase() === 'r')) {
      event.preventDefault();
      return;
    }

    // Block Alt+F4, Alt+Space, Alt+Tab
    if (input.alt && (input.key === 'F4' || input.key === ' ' || input.key === 'Tab')) {
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
    // Maintain kiosk fullscreen always
    mainWindow.setKiosk(true);
    mainWindow.setFullScreen(true);
  }
});

ipcMain.on('app:reload', () => {
  if (mainWindow) {
    mainWindow.reload();
  }
});

// Normal quit is blocked unless isAllowQuit is flagged
ipcMain.on('app:quit', () => {
  if (isAllowQuit) {
    app.quit();
  } else {
    console.log('[SECURITY] App quit request ignored without admin override (Alt+B).');
  }
});

// Explicit Admin Force Quit via Alt+B
ipcMain.on('app:force-quit', () => {
  console.log('[ADMIN] Force quit triggered via Alt+B.');
  isAllowQuit = true;
  app.quit();
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

  // Global Admin Shortcut: Alt+B strictly exits the kiosk
  try {
    const registered = globalShortcut.register('Alt+B', () => {
      console.log('[GLOBAL SHORTCUT] Alt+B pressed, exiting application...');
      isAllowQuit = true;
      app.quit();
    });
    if (registered) {
      console.log('[SECURITY] Global Alt+B shortcut registered successfully.');
    }
  } catch (err) {
    console.error('[SECURITY] Failed to register Alt+B global shortcut:', err);
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
      isAllowQuit = true;
      app.quit();
    }, 1500);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isAllowQuit) {
    app.quit();
  }
});

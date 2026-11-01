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

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[RENDERER ${level}] ${message} (${sourceId}:${line})`);
  });

  // Strict Kiosk Protection: prevent accidental close via Alt+F4 / taskbar / scripts
  mainWindow.on('close', (e) => {
    if (!isAllowQuit) {
      e.preventDefault();
      console.log('[SECURITY] Window close attempt prevented. Use Alt+B to exit.');
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
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
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
  mainWindow.setFullScreen(true);

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

const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

let mainWindow = null;

// Determine target app from command line arguments
// e.g. --app=fruit-ninja or --app=cv-workshop
function getTargetApp() {
  const arg = process.argv.find(a => a.startsWith('--app='));
  if (arg) {
    return arg.split('=')[1].trim().toLowerCase();
  }
  // Default to cv-workshop if not specified
  return 'cv-workshop';
}

function createWindow() {
  const targetApp = getTargetApp();
  const isFruitNinja = targetApp === 'fruit-ninja';

  // Automatically approve camera & media permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media' || permission === 'camera') {
      callback(true);
      return;
    }
    callback(false);
  });

  mainWindow = new BrowserWindow({
    width: isFruitNinja ? 1280 : 1366,
    height: isFruitNinja ? 720 : 768,
    minWidth: 1024,
    minHeight: 600,
    fullscreen: isFruitNinja, // Fruit ninja full screen for maximum game immersion
    frame: !isFruitNinja,     // Fruit ninja clean borderless or windowed toggleable
    autoHideMenuBar: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: false, // Allows simple direct communication in unpacked HTML/JS for workshop instructors
      webSecurity: false,      // Allows local file fetching of wasm and data models
      allowRunningInsecureContent: true
    },
    title: isFruitNinja ? 'Fruit Ninja - Vision Game' : 'Computer Vision Mini Workshop'
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[RENDERER ${level}] ${message} (${sourceId}:${line})`);
  });

  if (isFruitNinja) {
    mainWindow.loadFile(path.join(__dirname, '../fruit_ninja/index.html'));
  } else {
    mainWindow.loadFile(path.join(__dirname, '../cv_workshop/index.html'));
  }

  // Handle window close
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

ipcMain.on('app:quit', () => {
  app.quit();
});

ipcMain.on('app:switch-mode', (event, appName) => {
  if (!mainWindow) return;
  if (appName === 'fruit-ninja') {
    mainWindow.setFullScreen(true);
    mainWindow.loadFile(path.join(__dirname, '../fruit_ninja/index.html'));
  } else {
    mainWindow.setFullScreen(false);
    mainWindow.loadFile(path.join(__dirname, '../cv_workshop/index.html'));
  }
});

app.whenReady().then(() => {
  createWindow();

  if (process.argv.includes('--test-smoke')) {
    console.log('[SMOKE TEST] Electron window created and initialized successfully!');
    setTimeout(() => {
      app.quit();
    }, 1500);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

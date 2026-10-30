const { ipcRenderer } = require('electron');

window.electronAPI = {
  quit: () => ipcRenderer.send('app:quit'),
  toggleFullscreen: () => ipcRenderer.send('app:toggle-fullscreen'),
  reload: () => ipcRenderer.send('app:reload'),
  switchMode: (mode) => ipcRenderer.send('app:switch-mode', mode)
};

const { ipcRenderer } = require('electron');

// Global security capture hook: Swallow Tab key and Windows key in DOM to prevent focus traversal or shortcut triggering
window.addEventListener('keydown', (e) => {
  if (e.key === 'Tab' || e.code === 'Tab' || e.key === 'Meta' || e.code === 'MetaLeft' || e.code === 'MetaRight' || e.key === 'OS') {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);

window.electronAPI = {
  quit: () => ipcRenderer.send('app:quit'),
  forceQuit: () => ipcRenderer.send('app:force-quit'),
  togglePresenter: () => ipcRenderer.send('app:toggle-presenter'),
  toggleFullscreen: () => ipcRenderer.send('app:toggle-fullscreen'),
  reload: () => ipcRenderer.send('app:reload'),
  switchMode: (mode) => ipcRenderer.send('app:switch-mode', mode)
};

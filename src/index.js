const electron = require('electron');
const path = require('path');

const { app } = electron;
const { BrowserWindow } = electron;
let mainWindow;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      width: 1000,
      height: 600,
      transparent: false,
      frame: true,
      resizable: true,
      hasShadow: false,
      alwaysOnTop: false,
      nodeIntegration: true,
      webviewTag: true,
    },
  });
  mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

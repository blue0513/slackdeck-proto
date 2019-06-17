'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow;

app.on('window-all-closed', function() {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      width: 1000,
      height: 600,
      transparent: false,
      frame:       true,
      resizable:   true,
      hasShadow:   false,
      alwaysOnTop: false,
      nodeIntegration: true,
      webviewTag: true
    }
  });
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

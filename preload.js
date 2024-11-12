const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');
contextBridge.exposeInMainWorld('electron', {
  fs: fs,
  path: path,
  readdir: (dirPath) => ipcRenderer.invoke('readdir', dirPath),
  rename: (oldPath, newPath) => ipcRenderer.invoke('rename', oldPath, newPath),
});

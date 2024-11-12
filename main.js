// 이거 import로 바꿔도 됨?
// const { app, BrowserWindow, ipcMain } = require('electron');
const { app, BrowserWindow } = require('electron');
const path = require('path');
// const fs = require('fs');

// 임시
const remoteMain = require('@electron/remote/main');
remoteMain.initialize();

// 지정된 크기, 설정으로 window를 생성하고 index.html을 로드
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // 이게 뭔데
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      // contextIsolation: true, // contextIsolation 활성화
      // enableRemoteModule: false, // 필요 시 추가
      // nodeIntegration: true,
    },
  });

  remoteMain.enable(mainWindow.webContents);

  mainWindow.loadFile('renderer/index.html');
}

// 앱이 준비되면 window를 생성
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// ?
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ipcMain이 뭔데요
// ipcMain.handle('readdir', async (event, dirPath) => {
//   try {
//     return await fs.promises.readdir(dirPath);
//   } catch (error) {
//     console.error('Error reading directory', error); // 디버깅용 로그
//     throw error;
//   }
// });

// ipcMain.handle('rename', async (event, oldPath, newPath) => {
//   try {
//     await fs.promises.rename(oldPath, newPath);
//     console.log(`Successfully renamed ${oldPath} to ${newPath}`); // 디버깅용 로그
//   } catch (error) {
//     console.error(`Error renaming file ${oldPath} to ${newPath}`, error); // 디버깅용 로그
//     throw error;
//   }
// });

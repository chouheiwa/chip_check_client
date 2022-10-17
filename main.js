const { app, BrowserWindow, ipcMain, protocol } = require('electron')
const path = require('path')
const fs = require('fs');
const url = require('url');

async function handleSaveImage(event, {imageType, imageBase64}) {
  const appPath = app.getPath('appData');
  // 創建文件夾
  const dir = path.join(appPath, 'imageAndAnnotation');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  let dataPath;
  if (imageType === 'front') {
    dataPath = path.join(dir, 'front.jpg');
  } else if (imageType === 'back') {
    dataPath = path.join(dir, 'back.jpg');
  }
  fs.writeFileSync(dataPath, imageBase64.split(',')[1], 'base64');
  let dataUrl = url.pathToFileURL(dataPath).href;

  return dataUrl.replace('file:///', 'image://');
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload', 'preload.js')
    }
  })


  win.loadURL('http://localhost:8000')
}

// protocol.registerSchemesAsPrivileged([
//   {
//     scheme: 'http',
//     privileges: {
//       bypassCSP: true,
//       secure: true,
//       supportFetchAPI: true,
//       corsEnabled: true
//     }
//   }
// ]);


app.whenReady().then(() => {
  protocol.registerFileProtocol('image', (request, callback) => {
    const pathname = decodeURI(request.url.replace('image://', ''));
    callback(pathname);
  });
  ipcMain.handle('saveImage', handleSaveImage)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


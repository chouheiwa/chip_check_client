const { app, BrowserWindow, ipcMain, protocol } = require('electron')
const path = require('path')
const fs = require('fs');
const url = require('url');

async function handleSaveImage(event, {imageType, imageName, imageBase64}) {
  const appPath = app.getPath('appData');
  // 創建文件夾
  const dir = path.join(appPath, 'imageAndAnnotation');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  let dataPath;
  if (imageType === 'front') {
    dataPath = path.join(dir, `front-${imageName ?? ''}.jpg`);
  } else if (imageType === 'back') {
    dataPath = path.join(dir, `back-${imageName ?? ''}.jpg`);
  }
  fs.writeFileSync(dataPath, imageBase64.split(',')[1], 'base64');
  let dataUrl = url.pathToFileURL(dataPath).href;

  return dataUrl.replace('file:///', 'atom://');
}
let win = null;

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload', 'preload.js')
    }
  })

  win.loadURL('http://localhost:8000')
}

async function handleOpenLabelImage(event, {imageType}) {
  return new Promise((resolve, reject) => {
    console.log(imageType);
    const child = new BrowserWindow({ parent: win, modal: true, show: true,webPreferences: {
        preload: path.join(__dirname, 'electron-preload', 'preload-label-image.js')
      }});
    child.loadFile(path.join(__dirname, 'electron-preload', 'label-image.html'), {query: {imageType}});
    ipcMain.handleOnce('labelImageUpdate', async (event, {imageBase64, annotations}) => {
      const fileUrl = await handleSaveImage(null, {imageType, imageBase64, imageName: 'annotation'});
      child.destroy();
      resolve({fileUrl, annotations});
    });
    child.on('close', () => {
      ipcMain.removeHandler('labelImageUpdate');
    });
  });
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
  protocol.registerFileProtocol('atom', (request, callback) => {
    const pathname = decodeURI(request.url.replace('atom://', ''));
    callback(pathname);
  });
  ipcMain.handle('saveImage', handleSaveImage);
  ipcMain.handle('openLabelImage', handleOpenLabelImage);
  ipcMain.handle('getImagePath', async (event, {imageType}) => {
    const appPath = app.getPath('appData');
    const dir = path.join(appPath, 'imageAndAnnotation');
    let imagePath;
    let imageAnnotationPath;
    if (imageType === 'front') {
      imagePath = path.join(dir, `front.jpg`)
      imageAnnotationPath = path.join(dir, `front-annotation.json`)
    } else if (imageType === 'back') {
      imagePath = path.join(dir, `back.jpg`);
      imageAnnotationPath = path.join(dir, `back-annotation.json`);
    }
    let imageUrl = url.pathToFileURL(imagePath).href.replace('file:///', 'atom://');
    let imageAnnotationUrl = url.pathToFileURL(imageAnnotationPath).href.replace('file:///', 'atom://');
    return {imageUrl, imageAnnotationUrl};
  });
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


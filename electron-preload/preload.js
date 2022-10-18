const { contextBridge, ipcRenderer } = require('electron');

console.log('preload.js');

contextBridge.exposeInMainWorld('electronExpose', {
  saveImage: (imageType, imageBase64) => ipcRenderer.invoke('saveImage', {imageType, imageBase64}),
  openLabelImage: (imageType) => ipcRenderer.invoke('openLabelImage', {imageType}),
})

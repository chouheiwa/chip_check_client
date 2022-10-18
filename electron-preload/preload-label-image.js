const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronLabelImage', {
  labelImageUpdate: (imageType, imageBase64, annotations) => ipcRenderer.invoke('labelImageUpdate', {imageBase64, annotations}),
  getImagePath:(imageType) => ipcRenderer.invoke('getImagePath', {imageType}),
})

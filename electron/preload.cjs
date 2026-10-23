const { contextBridge, ipcRenderer } = require('electron');

// No generic IPC, filesystem, shell or Node APIs are exposed to the page.
contextBridge.exposeInMainWorld('miaoxiuDesktop', Object.freeze({
  saveImage: (bytes, filename) => ipcRenderer.invoke('miao:save-image', { bytes, filename }),
}));

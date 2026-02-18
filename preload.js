// preload.js - Bridge sicuro tra renderer e main process
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vaultAPI', {
  scanUsb: () => ipcRenderer.invoke('scan-usb'),
  createVault: (data) => ipcRenderer.invoke('create-vault', data),
  openVault: (data) => ipcRenderer.invoke('open-vault', data),
  saveVault: (data) => ipcRenderer.invoke('save-vault', data),
  generatePassword: (opts) => ipcRenderer.invoke('generate-password', opts),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectCsvFile: () => ipcRenderer.invoke('select-csv-file'),
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  platform: process.platform,
});

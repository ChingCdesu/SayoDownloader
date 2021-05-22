import { ipcMainHandle } from "./ipc-main";
import { dialog } from "electron";
import fs from 'fs'

const showOpenDialog = (options: Electron.OpenDialogOptions) => {
  return dialog.showOpenDialogSync(options)
}

const checkPathExists = (path: string) => {
  return fs.existsSync(path)
}

const registerListener = () => {
  ipcMainHandle('showOpenDialog', (event, options: Electron.OpenDialogOptions)=>{
    return showOpenDialog(options)
  })
  ipcMainHandle('checkPathExists', (event, path: string) => {
    return checkPathExists(path)
  })
}

export const registerAppService = () => {
  registerListener()
};

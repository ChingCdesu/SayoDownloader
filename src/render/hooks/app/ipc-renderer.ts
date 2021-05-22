import { ipcRenderer } from "electron";
import { IPCEventName } from "@src/common/interfaces/app";

export const ipcRendererInvoke = <T>(
  eventName: IPCEventName,
  ...args: any[]
): Promise<T> => ipcRenderer.invoke(eventName, ...args);

export const showOpenDialog = (options: Electron.OpenDialogOptions): Promise<string[] | undefined> => {
  return ipcRendererInvoke('showOpenDialog', options)
}

export const checkPathExists = (path: string): Promise<boolean> => {
  return ipcRendererInvoke('checkPathExists', path)
}
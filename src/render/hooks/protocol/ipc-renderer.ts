import { IpcRendererEvent, ipcRenderer } from "electron";

import { IPCEventName } from "@src/common/interfaces/protocol";

/**
 * 添加 ipc 调用监听事件
 * @param eventName - ipc 事件名
 * @param callback - 回调函数
 */
const ipcRendererListener = (
  eventName: IPCEventName,
  callback: (event: IpcRendererEvent, ...args: any[]) => void
): void => {
  ipcRenderer.on(eventName, (event, ...args: any[]) => {
    callback(event, ...args);
  });
};

export const listenerLinkBeatmap = (
  callback: (event: IpcRendererEvent, ...args: any[]) => void
) => ipcRendererListener("link-beatmap", callback);

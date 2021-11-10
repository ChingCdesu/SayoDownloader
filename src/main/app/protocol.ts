import { BrowserWindow, protocol } from "electron"

export const registerSayoProtocol = (window: BrowserWindow | null): void => {
  protocol.registerHttpProtocol('sayo', (request, cb) => {
    window?.webContents.send('link-beatmap', request.url)
  })
}

/**
 * electron 主文件
 */
import { join } from "path"
import { app, BrowserWindow, session } from "electron"
import { Main } from "./window"
import dotenv from "dotenv"
import store from "@src/common/utils/store"
import { version } from "@src/common/constant"
import { registerDownloadService } from "./download"
import { registerAppService } from "./app"
import { registerSayoProtocol } from "./app/protocol"

dotenv.config({ path: join(__dirname, "../../.env") })

let mainWin = new Main()

function init() {
  store.set("phase", version)
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] = `SayoDownloader v${store.get(
      "phase"
    )} powered by Electron`
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })
  registerAppService()
  mainWin.open()
  registerDownloadService(mainWin.win)
  registerSayoProtocol()
}

const lock = app.requestSingleInstanceLock()
if (!lock) {
  app.quit()
} else {
  app.on("second-instance", (event, argv) => {
    let win = mainWin.win
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
      argv.forEach((v) => {
        if (v.startsWith("sayo:") && win) {
          win.webContents.send("link-beatmap", v)
        }
      })
    }
  })
  app.on('open-url', (event, url) => {
    mainWin.win?.webContents.send('link-beatmap', url)
  })
  app.whenReady().then(init)
}

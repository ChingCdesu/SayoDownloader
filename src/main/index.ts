/**
 * electron 主文件
 */
import { join } from 'path'
import { app, session } from 'electron'
import { Main, registerDownloadService, registerApiService } from './window'
import Store from 'electron-store'
import dotenv from 'dotenv'

dotenv.config({ path: join(__dirname, '../../.env') })

function init() {
  // const loginWin = new Login()
  const mainWin = new Main()
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Sayo Downloader Electron v0.0.1';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  })
  const mainOpen = () => {
    mainWin.open()
    registerDownloadService(mainWin.win);
    registerApiService()
  }
  mainOpen()
}

app.whenReady().then(init)

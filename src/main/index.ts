/**
 * electron 主文件
 */
import { join } from 'path'
import { app, session } from 'electron'
import { Main, registerDownloadService } from './window'
import store from '@src/common/utils/store'
import dotenv from 'dotenv'
import {
  TOGGLE_DEVTOOLS,
} from '@src/common/constant/event'

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
    const unsubscribeDevtool = mainWin.subscribe(TOGGLE_DEVTOOLS, win => {
      mainWin.win?.webContents.toggleDevTools()
    })
  }
  mainOpen()
}

app.whenReady().then(init)

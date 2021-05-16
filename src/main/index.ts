/**
 * electron 主文件
 */
import { join } from 'path'
import { app, session } from 'electron'
import { Main, registerDownloadService } from './window'
import store from '@src/common/utils/store'
import dotenv from 'dotenv'

dotenv.config({ path: join(__dirname, '../../.env') })

function init() {
  // const loginWin = new Login()
  const mainWin = new Main()
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = `SayoDownloader v${store.get('phase')} powered by Electron`;
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  })
  const mainOpen = () => {
    mainWin.open()
    registerDownloadService(mainWin.win);
  }
  mainOpen()
}

app.whenReady().then(init)

/**
 * electron 主文件
 */
import { join } from 'path'
import { app } from 'electron'
import { Main } from './window'
import store from '@src/common/utils/store'
import dotenv from 'dotenv'
import {
  TOGGLE_DEVTOOLS,
} from '@src/common/constant/event'

dotenv.config({ path: join(__dirname, '../../.env') })

function init() {
  // const loginWin = new Login()
  const mainWin = new Main()

  const mainOpen = () => {
    mainWin.open()
    const unsubscribeDevtool = mainWin.subscribe(TOGGLE_DEVTOOLS, win => {
      mainWin.win?.webContents.toggleDevTools()
    })
  }
  mainOpen()
}

app.whenReady().then(init)

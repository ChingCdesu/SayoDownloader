import Store from 'electron-store'
import { app } from 'electron'

const store = new Store({
    name: 'store',
    defaults: {
        defaultDownloadPath: app?.getPath('downloads'),
        displayWithUnicode: false
    },
})
export default store
import Store from 'electron-store'
import { app } from 'electron'

const store = new Store({
    name: 'store',
    defaults: {
        defaultDownloadPath: app?.getPath('downloads'),
        displayWithUnicode: false,
        openDownloaded: false,
        oszVersion: 'full'
    },
})
export default store
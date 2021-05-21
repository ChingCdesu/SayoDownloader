import Store from 'electron-store'
import { app } from 'electron'

export default new Store({
    name: 'store',
    defaults: {
        defaultDownloadPath: app?.getPath('downloads'),
        displayWithUnicode: false
    },
    
    schema: {
        defaultDownloadPath: {
            type: 'string'
        },
        displayWithUnicode: {
            type: 'boolean'
        },
    }
})

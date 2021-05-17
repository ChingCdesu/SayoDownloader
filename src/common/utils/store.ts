import Store from 'electron-store'
import { app } from 'electron'

export default new Store({
    name: 'store',
    migrations: {
        '0.0.1': store => {
            store.set('debugPhase', true)
            store.set('phase', '0.0.1')
        }
    },
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

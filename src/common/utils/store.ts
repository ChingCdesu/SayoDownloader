import Store = require('electron-store')
import electron = require('electron')

export default new Store({
    name: 'store',
    migrations: {
        '0.0.1': store => {
            store.set('debugPhase', true)
            store.set('phase', '0.0.1')
        }
    },
    defaults: {
        defaultDownloadPath: electron.app.getPath('downloads'),
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

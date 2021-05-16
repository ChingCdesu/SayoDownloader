import Store from 'electron-store'

export default new Store({
    name: 'store',
    migrations: {
        '0.0.1': store => {
            store.set('debugPhase', true)
            store.set('phase', '0.0.1')
        }
    }
})

import { createApp } from 'vue'
import App from './App'
import router from './router'
import Antd from 'ant-design-vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faFileDownload, faPlay, faRedo, faPause, faStar } from '@fortawesome/free-solid-svg-icons'
import { faHeart, faFileArchive, faFolderOpen, faFile } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// vite 会编译 import 的形式；所以 electron 及 node.js 内置模块用 require 形式
// const fs = require('fs')
// const { ipcRenderer } = require('electron')

import 'ant-design-vue/dist/antd.css'
import '@/assets/style/boot4-part.less'
import '@/assets/fonts/torus/torus.less'
import './index.less'

library.add(faFileDownload, faHeart, faPlay, faFileArchive, faRedo, faFolderOpen, faPause, faFile, faStar)


createApp(App)
    .use(router)
    .use(Antd)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')
    .$nextTick(window.ClosePreloadLoading)

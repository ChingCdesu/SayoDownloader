import Electron = require('electron')
import {AxiosRequestConfig} from "axios";

export const get = async (url: string, config?: AxiosRequestConfig) => {
    return await Electron.ipcRenderer.invoke('axios-get', url, config)
}

export const post = async (url: string, config?: AxiosRequestConfig) => {
    return await Electron.ipcRenderer.invoke('axios-post', url, config)
}

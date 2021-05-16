import axios, {AxiosInstance, AxiosRequestConfig} from "axios";
import {VERSION} from "@src/common/constant";
import {ipcMain} from 'electron'

const singletonEnforcer = Symbol('api singleton enforcer')

class ApiService {
    private constructor(enforcer: Symbol) {
        if (enforcer !== singletonEnforcer) {
            throw new Error('Cannot construct singleton')
        }
        this._instance = axios.create({
            baseURL: 'https://api.sayobot.cn',
            headers: {
                'User-Agent': `SayoDownloader v${VERSION} powered by Electron`
            }
        })
    }

    private static singleton: ApiService
    private _instance: AxiosInstance

    public get = (url: string, config?: AxiosRequestConfig) => this._instance.get(url, config)
    public post = (url: string, config?: AxiosRequestConfig) => this._instance.post(url, config)

    public static get instance() {
        if (!this.singleton) {
            this.singleton = new ApiService(singletonEnforcer)
        }
        return this.singleton
    }
}

export const registerApiService =  () => {
    ipcMain.handle('axios-get', async (event, url: string, config?: AxiosRequestConfig) => {
        return await ApiService.instance.get(url, config)
    })

    ipcMain.handle('axios-post', async (event, url: string, config?: AxiosRequestConfig) => {
        return await ApiService.instance.post(url, config)
    })
}

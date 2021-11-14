import axios, {AxiosInstance, AxiosRequestConfig} from "axios";

const singletonEnforcer = Symbol("api singleton enforcer");

class ApiService {
    private constructor(enforcer: symbol) {
        if (enforcer !== singletonEnforcer) {
            throw new Error("Cannot construct singleton");
        }
        this._instance = axios.create({
            baseURL: "https://api.sayobot.cn",
        });
    }

    private static singleton: ApiService;
    private _instance: AxiosInstance;

    public get = (url: string, config?: AxiosRequestConfig) => this._instance.get(url, config);
    public post = (url: string, data?: any, config?: AxiosRequestConfig) => this._instance.post(url, data, config);

    public static get instance() {
        if (!this.singleton) {
            this.singleton = new ApiService(singletonEnforcer);
        }
        return this.singleton;
    }
}

export default ApiService.instance;

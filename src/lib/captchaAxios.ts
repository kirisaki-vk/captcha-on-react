import {AxiosError, AxiosInstance} from "axios";
import { renderCaptcha } from "./captcha";

declare class AwsWafIntegration {
    public static getToken(): Promise<string>
}

export function getAxiosCapthchaInstance(axiosInstance: AxiosInstance) {
    // Ensure a token exists before making the request
    axiosInstance.interceptors.request.use(config => {
        return AwsWafIntegration.getToken().then((token) => {
            // add the header x-aws-waf-token: token if doing cross domain requests
            config.headers["x-aws-waf-token"] = token
            return config
        })
    }, _ => Promise.reject(_))

    return axiosInstance;
}
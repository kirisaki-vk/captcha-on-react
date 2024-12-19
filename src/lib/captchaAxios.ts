import axios, {AxiosError, AxiosInstance} from "axios";
import { renderCaptcha } from "./captcha";

declare class AwsWafIntegration {
    public static getToken(): Promise<string>
}

export function getAxiosCapthchaInstance(axiosInstance: AxiosInstance, capthcaApiKey: string, containerId: string) {
    const captchaRequired = (error: AxiosError) =>
        error.response.status === 405 && error.response.headers['x-amzn-waf-action'] === 'captcha'

    // Use an Axios interceptor to render the CAPTCHA if the WAF requires it
    axiosInstance.interceptors.response.use(response => response, (error) => {
        console.log("verifying render");
        
        if ( error && captchaRequired(error)) {
            return renderCaptcha(capthcaApiKey, containerId).then(() => {
                // add the header x-aws-waf-token: token if doing cross domain requests
                return axiosInstance.request(error.config)
            })
        } else return Promise.reject(error)
    })

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
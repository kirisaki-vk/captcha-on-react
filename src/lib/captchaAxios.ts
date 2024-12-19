import axios from "axios";
import { renderCaptcha } from "./captcha";

export function getAxiosCapthchaInstance(capthcaApiKey: string, integrationUrl: string, containerId: string) {
    const client = axios.create()
    const captchaRequired = (error) =>
        error.response.status === 405 && error.response.headers['x-amzn-waf-action'] === 'captcha'

    // Use an Axios interceptor to render the CAPTCHA if the WAF requires it
    client.interceptors.response.use(response => response, (error) => {
        if (captchaRequired(error)) {
            return renderCaptcha(capthcaApiKey, integrationUrl, containerId).then(token => {
                // add the header x-aws-waf-token: token if doing cross domain requests
                return client.request(error.config)
            })
        } else return Promise.reject(error)
    })

    // Ensure a token exists before making the request
    client.interceptors.request.use(config => {
        return window.AwsWafIntegration.getToken().then((token) => {
            // add the header x-aws-waf-token: token if doing cross domain requests
            config.headers["x-aws-waf-token"] = token
            return config
        })
    }, _ => Promise.reject(_))

    return client;
}
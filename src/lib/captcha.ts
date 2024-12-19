import "./types"

const WAF_TAG_ID = 'aws_waf_captcha_integration_url';

export function loadScript(integrationUrl: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (document.getElementById(WAF_TAG_ID)) return resolve();

        const script = document.createElement('script');
        script.id = WAF_TAG_ID;
        script.async = false;
        script.src = integrationUrl;
        script.type = 'text/javascript';
        document.head.appendChild(script);

        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load aws waf cdn api'));
    });
}

export function unloadScript() {
    const wafScriptTag = document.getElementById(WAF_TAG_ID);
    if (wafScriptTag) {
        wafScriptTag.onload = null;
        wafScriptTag.onerror = null;
        wafScriptTag.remove();
    }
}

export function renderCaptcha(apiKey: string, integrationUrl: string, containerId: string) {

    document.body.style.cursor = 'wait';
    const container = document.getElementById(containerId);

    return new Promise((resolve, reject) => {
      container?.style.visibility = "visible";

      loadScript(integrationUrl);
      window.AwsWafCaptcha.renderCaptcha(container, {
        onSuccess: (wafToken) => {
          container?.style.visibility = "hidden"
          resolve(wafToken)
        },
        onLoad: () => {
          document.body.style.cursor = 'default'
        },
        onError: () => {
            reject("Error when loading captcha")
            container?.style.visibility = "hidden"
        },
        onPuzzleTimeout: () => reject("puzzleTimeout"),
        onPuzzleIncorrect: () => reject('onPuzzleIncorrect'),
        onPuzzleCorrect: () => reject('onPuzzleCorrect'),

        apiKey: apiKey
      })
    })
}
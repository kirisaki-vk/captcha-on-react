declare type AwsWafCaptchaOptions = {
  apiKey: string;
  onLoad?: () => void;
  onSuccess?: (token: string) => void;
  onError?: (error: unknown) => void;
  onPuzzleTimeout?: () => void;
  onPuzzleIncorrect?: () => void;
  onPuzzleCorrect?: () => void;
};

declare class AwsWafCaptcha {
  public static renderCaptcha(
    container: HTMLElement,
    options: AwsWafCaptchaOptions,
  ): void;
}

export type RendererCaptchaOptions = Omit<AwsWafCaptchaOptions, 'apiKey'>;

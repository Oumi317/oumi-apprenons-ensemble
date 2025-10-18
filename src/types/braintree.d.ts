declare module 'braintree-web-drop-in' {
  export interface DropinOptions {
    authorization: string;
    container: HTMLElement | string;
    card?: {
      cardholderName?: {
        required?: boolean;
      };
    };
  }

  export interface DropinInstance {
    requestPaymentMethod: () => Promise<{ nonce: string }>;
    teardown: () => void;
  }

  const dropin: {
    create: (options: DropinOptions) => Promise<DropinInstance>;
  };

  export default dropin;
}

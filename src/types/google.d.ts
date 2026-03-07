export {};

declare global {
    interface ImportMetaEnv {
        readonly VITE_GOOGLE_CLIENT_ID?: string;
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }

    interface GoogleCredentialResponse {
        credential?: string;
        select_by?: string;
    }

    interface GoogleIdConfiguration {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        context?: 'signin' | 'signup' | 'use';
        ux_mode?: 'popup' | 'redirect';
        login_uri?: string;
    }

    interface GoogleSignInButtonConfiguration {
        type?: 'standard' | 'icon';
        theme?: 'outline' | 'filled_blue' | 'filled_black';
        size?: 'large' | 'medium' | 'small';
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
        shape?: 'rectangular' | 'pill' | 'circle' | 'square';
        width?: number;
        logo_alignment?: 'left' | 'center';
        locale?: string;
    }

    interface Window {
        google?: {
            accounts?: {
                id?: {
                    initialize: (config: GoogleIdConfiguration) => void;
                    renderButton: (
                        parent: HTMLElement,
                        options: GoogleSignInButtonConfiguration
                    ) => void;
                    prompt: () => void;
                    cancel: () => void;
                };
            };
        };
    }
}

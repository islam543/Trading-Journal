import { useEffect, useRef, useState } from 'react';
import './GoogleAuthButton.css';

interface GoogleAuthButtonProps {
    onSuccess: (credential: string) => Promise<void>;
    onError: (message: string) => void;
    disabled?: boolean;
}

const GOOGLE_GSI_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_GSI_SCRIPT_ID = 'google-gsi-client';

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
    if (window.google?.accounts?.id) {
        return Promise.resolve();
    }

    if (googleScriptPromise) {
        return googleScriptPromise;
    }

    googleScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.getElementById(GOOGLE_GSI_SCRIPT_ID) as HTMLScriptElement | null;
        if (existingScript) {
            if (existingScript.dataset.loaded === 'true' || window.google?.accounts?.id) {
                resolve();
                return;
            }
            existingScript.addEventListener('load', () => resolve(), { once: true });
            existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In script.')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.id = GOOGLE_GSI_SCRIPT_ID;
        script.src = GOOGLE_GSI_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Google Sign-In script.'));
        document.head.appendChild(script);
    });

    return googleScriptPromise;
}

const GoogleAuthButton = ({ onSuccess, onError, disabled = false }: GoogleAuthButtonProps) => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!clientId) {
            onError('Google login is not configured. Missing VITE_GOOGLE_CLIENT_ID.');
            setIsLoading(false);
            return () => {
                isMounted = false;
            };
        }

        loadGoogleScript()
            .then(() => {
                if (!isMounted || !buttonRef.current || !window.google?.accounts?.id) {
                    return;
                }

                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response) => {
                        if (!response.credential) {
                            onError('Google did not return a valid credential.');
                            return;
                        }

                        try {
                            await onSuccess(response.credential);
                        } catch (error) {
                            onError(error instanceof Error ? error.message : 'Google authentication failed.');
                        }
                    },
                });

                buttonRef.current.innerHTML = '';
                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: 'outline',
                    size: 'large',
                    text: 'continue_with',
                    shape: 'pill',
                    width: 320,
                });
            })
            .catch(() => {
                if (isMounted) {
                    onError('Unable to load Google Sign-In. Please try again.');
                }
            })
            .finally(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [onError, onSuccess]);

    return (
        <div className={`google-auth-wrapper ${disabled ? 'is-disabled' : ''}`}>
            <div ref={buttonRef} className="google-auth-button-slot" />
            {isLoading && <span className="google-auth-loading">Loading Google sign-in…</span>}
        </div>
    );
};

export default GoogleAuthButton;

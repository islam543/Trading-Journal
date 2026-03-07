import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { login, googleAuth } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleAuth = useCallback(async (credential: string) => {
        setError('');
        setSubmitting(true);

        try {
            await googleAuth(credential);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google auth failed');
        } finally {
            setSubmitting(false);
        }
    }, [googleAuth, navigate]);

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-branding">
                    <h1>Trade Journal</h1>
                    <p>Welcome back, trader</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error">{error}</div>}

                    <div className="auth-field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Logging in…' : 'Log In'}
                    </button>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <GoogleAuthButton
                        onSuccess={handleGoogleAuth}
                        onError={setError}
                        disabled={submitting}
                    />
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

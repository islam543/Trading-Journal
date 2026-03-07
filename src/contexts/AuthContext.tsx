import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    googleAuth: (credential: string) => Promise<void>;
    logout: () => void;
    authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
            fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${savedToken}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error('Invalid token');
                    return res.json();
                })
                .then((data) => {
                    setUser(data);
                    setToken(savedToken);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Login failed');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const signup = async (email: string, password: string, name: string) => {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Signup failed');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const googleAuth = async (credential: string) => {
        const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Google auth failed');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }, []);

    const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
        const currentToken = localStorage.getItem('token');
        const headers = new Headers(options.headers);
        if (currentToken) {
            headers.set('Authorization', `Bearer ${currentToken}`);
        }
        return fetch(url, { ...options, headers });
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, googleAuth, logout, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

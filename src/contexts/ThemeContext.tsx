import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ThemeIntensity } from '../types';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
    themeIntensity: ThemeIntensity;
    setThemeIntensity: (intensity: ThemeIntensity) => void;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    toggleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeIntensity, setThemeIntensity] = useState<ThemeIntensity>(() => {
        const saved = localStorage.getItem('themeIntensity');
        return (saved as ThemeIntensity) || 'medium';
    });

    const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('themeMode');
        return (saved as ThemeMode) || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('themeIntensity', themeIntensity);
        document.body.classList.remove('theme-low', 'theme-medium', 'theme-high');
        document.body.classList.add(`theme-${themeIntensity}`);
    }, [themeIntensity]);

    useEffect(() => {
        localStorage.setItem('themeMode', themeMode);
        if (themeMode === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, [themeMode]);

    const toggleThemeMode = useCallback(() => {
        setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    return (
        <ThemeContext.Provider value={{ themeIntensity, setThemeIntensity, themeMode, setThemeMode, toggleThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

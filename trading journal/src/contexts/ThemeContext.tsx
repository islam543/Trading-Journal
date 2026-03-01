import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ThemeIntensity } from '../types';

interface ThemeContextType {
    themeIntensity: ThemeIntensity;
    setThemeIntensity: (intensity: ThemeIntensity) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeIntensity, setThemeIntensity] = useState<ThemeIntensity>(() => {
        const saved = localStorage.getItem('themeIntensity');
        return (saved as ThemeIntensity) || 'medium';
    });

    useEffect(() => {
        localStorage.setItem('themeIntensity', themeIntensity);

        // Remove existing theme classes from body
        document.body.classList.remove('theme-low', 'theme-medium', 'theme-high');
        // Add new theme class
        document.body.classList.add(`theme-${themeIntensity}`);
    }, [themeIntensity]);

    return (
        <ThemeContext.Provider value={{ themeIntensity, setThemeIntensity }}>
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

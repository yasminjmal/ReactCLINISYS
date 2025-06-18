// src/components/shared/ThemeToggleButton.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title={theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
        >
            {theme === 'dark' ? (
                <Sun size={20} aria-hidden="true" />
            ) : (
                <Moon size={20} aria-hidden="true" />
            )}
        </button>
    );
};

export default ThemeToggleButton;
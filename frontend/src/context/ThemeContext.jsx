import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Intentar obtener el tema guardado o usar el del sistema
    const [theme, setTheme] = useState(() => {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            const { theme: savedTheme } = JSON.parse(savedSettings);
            if (savedTheme) return savedTheme;
        }

        // Si no hay configuración guardada, intentar detectar preferencia del sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
        return 'dark'; // Default a dark
    });

    useEffect(() => {
        // Aplicar la clase al body
        const body = document.body;

        // Eliminar clases previas
        body.classList.remove('light-mode', 'dark-mode');

        let activeTheme = theme;
        if (theme === 'auto') {
            activeTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }

        body.classList.add(`${activeTheme}-mode`);

        // También podemos usar dataset para selectores CSS más limpios
        body.setAttribute('data-theme', activeTheme);

        // Guardar en localStorage si cambia (aunque Configuracion ya lo hace, esto asegura consistencia)
        const savedSettings = localStorage.getItem('userSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : {};
        localStorage.setItem('userSettings', JSON.stringify({ ...settings, theme }));

    }, [theme]);

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

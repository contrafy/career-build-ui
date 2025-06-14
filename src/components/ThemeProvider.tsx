// src/components/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

// Context for theme state
const ThemeProviderContext = createContext<ThemeProviderState>({
    theme: "system",
    setTheme: () => { },
});

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "cb-theme",
}: ThemeProviderProps) {
    // Initialize theme state from localStorage or default value
    const [theme, internalSetTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    // Effect to apply the theme class to the document
    useEffect(() => {
        const html = document.documentElement;
        // Determine whether dark mode should be active
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark =
            theme === "dark" || (theme === "system" && systemDark);

        html.classList.toggle("dark", isDark);           // Only manage 'dark' class
    }, [theme]);

    // Function to update theme state and localStorage
    const setTheme = (newTheme: Theme) => {
        localStorage.setItem(storageKey, newTheme);
        internalSetTheme(newTheme);
    };

    return (
        <ThemeProviderContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

// Hook to access theme
export const useTheme = () => {
    const ctx = useContext(ThemeProviderContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
};

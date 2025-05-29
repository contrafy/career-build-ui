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

const ThemeProviderContext = createContext<ThemeProviderState>({
    theme: "system",
    setTheme: () => { },
});

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "cb-theme",
}: ThemeProviderProps) {
    const [theme, internalSetTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    useEffect(() => {
        const html = document.documentElement;
        // determine whether dark mode should be active
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark =
            theme === "dark" || (theme === "system" && systemDark);

        html.classList.toggle("dark", isDark);           // ← only manage 'dark' class
    }, [theme]);

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

export const useTheme = () => {
    const ctx = useContext(ThemeProviderContext);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
};

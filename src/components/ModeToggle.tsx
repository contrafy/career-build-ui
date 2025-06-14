// src/components/ModeToggle.tsx
import { useCallback } from "react";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "./ThemeProvider";

export function ModeToggle() {
    const { theme, setTheme } = useTheme(); // useTheme hook provides current theme and setTheme function

    // Cycle theme: system → (opposite of system) → light → dark → system
    const toggle = useCallback(() => {
        const next =
            theme === "system"
                ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark")
                : theme === "light"
                    ? "dark"
                    : "system";
        setTheme(next);
    }, [theme, setTheme]);

    // Determine if UI should render in dark mode
    const isDark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    return (
        <div className="flex items-center space-x-1">
            <Sun className="h-4 w-4 text-yellow-500" />
            {/* Toggle switch */}
            <Switch checked={isDark} onCheckedChange={toggle} />
            <Moon className="h-4 w-4 text-gray-400" />
        </div>
    );
}

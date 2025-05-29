// src/components/ModeToggle.tsx
import { useCallback } from "react";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "./ThemeProvider";            // use new context

export function ModeToggle() {
    const { theme, setTheme } = useTheme();

    const toggle = useCallback(() => {
        const next =
            theme === "system"
                ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "light" : "dark")
                : theme === "light"
                    ? "dark"
                    : "system";
        setTheme(next);
    }, [theme, setTheme]);

    const isDark =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    return (
        <div className="flex items-center space-x-1">
            <Sun className="h-4 w-4 text-yellow-500" />
            <Switch checked={isDark} onCheckedChange={toggle} />  {/* switch uses toggle */}
            <Moon className="h-4 w-4 text-gray-400" />
        </div>
    );
}

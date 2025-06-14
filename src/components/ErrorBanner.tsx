// src/components/ErrorBanner.tsx
import React from "react";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils"; // your class-merge util

// Renders toast container for error messages
export const ErrorBanner: React.FC = () => (
    <Toaster
        position="top-center"
        richColors
        toastOptions={{
            className: cn(
                "max-w-2xl mx-auto px-4 py-2 rounded-b-lg shadow-lg",
                "bg-destructive-foreground/10 text-destructive dark:bg-destructive/10 dark:text-destructive-foreground"
            ),
            duration: 5000,
        }}
    />
);

// Show error toast with warning icon
export function showError(message: string) {
    toast.error(message, {
        icon: "⚠️",
    });
}

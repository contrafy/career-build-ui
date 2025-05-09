// src/components/ResumeUpload.tsx
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";   // shadcn
import { Button } from "@/components/ui/button";

interface Props {
    /** Called when the backend responds (optional for now) */
    onDone?: (payload: any) => void;
}

/* ▒▒▒  Tiny “choose file → POST /api/resume” widget  ▒▒▒ */
export default function ResumeUpload({ onDone }: Props) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function sendFile(file: File) {
        setUploading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append("resume", file, file.name);      // ← field name should match backend

            const res = await fetch("/api/resume", {   // ← choose your route
                method: "POST",
                body: fd,
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();             // optional
            onDone?.(data);
        } catch (e: any) {
            setError(e.message ?? "Upload failed");
        } finally {
            setUploading(false);
        }
    }

    /* When user picks a file from the hidden input */
    const handleChange = (files: FileList | null) => {
        if (!files?.[0]) return;
        if (files[0].type !== "application/pdf") {
            setError("Please upload a PDF"); return;
        }
        sendFile(files[0]);
    };

    return (
        <div className="flex gap-3 items-center">
            {/* hidden real <input> */}
            <Input
                ref={fileInput}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleChange(e.target.files)}
            />

            {/* visible trigger */}
            <Button size="sm" onClick={() => fileInput.current?.click()}>
                {uploading ? "Uploading…" : "Upload résumé (PDF)"}
            </Button>

            {/* tiny status line */}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

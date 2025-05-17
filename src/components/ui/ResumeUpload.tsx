// src/components/ui/ResumeUpload.tsx
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** Called when the backend responds */
  onParsed?: (payload: any) => void;
}

/** States the upload button can be in */
type UploadState = "idle" | "uploading" | "success" | "error";

/* "choose file → POST /api/resume" widget with animations */
export default function ResumeUpload({ onParsed }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Reset to idle state after success animation completes
  const resetToIdle = () => {
    setTimeout(() => {
      setUploadState("idle");
    }, 1500);
  };

  async function sendFile(file: File) {
    setUploadState("uploading");
    setError(null);
    try {
      const fd = new FormData();
      fd.append("resume", file, file.name);
      const res = await fetch("/api/test_llm_resume_parsing", {
        method: "POST",
        body: fd,
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      const data = await res.json();
      onParsed?.(data);
      
      // Show success state briefly before returning to idle
      setUploadState("success");
      resetToIdle();
    } catch (e: any) {
      setError(e.message ?? "Upload failed");
      setUploadState("error");
    }
  }

  /* When user picks a file from the hidden input */
  const handleChange = (files: FileList | null) => {
    if (!files?.[0]) return;
    if (files[0].type !== "application/pdf") {
      setError("Please upload a PDF");
      setUploadState("error");
      return;
    }
    sendFile(files[0]);
  };

  // Content variations based on state
  const buttonContent = {
    idle: (
      <>
        <Upload className="mr-2 h-4 w-4" />
        Upload résumé (PDF)
      </>
    ),
    uploading: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </>
    ),
    success: (
      <>
        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
        Success!
      </>
    ),
    error: (
      <>
        <Upload className="mr-2 h-4 w-4" />
        Try again
      </>
    ),
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
      
      {/* visible animated button */}
      <AnimatePresence mode="wait">
        <motion.div
          key={uploadState}
          initial={{ width: "auto" }}
          animate={{ width: "auto" }}
          exit={{ width: "auto" }}
          transition={{ duration: 0.2 }}
        >
          <Button 
            size="sm" 
            onClick={() => fileInput.current?.click()}
            className={cn(
              "flex items-center",
              uploadState === "uploading" && "cursor-not-allowed opacity-80",
              uploadState === "success" && "bg-green-600 hover:bg-green-700"
            )}
            disabled={uploadState === "uploading"}
          >
            {buttonContent[uploadState]}
          </Button>
        </motion.div>
      </AnimatePresence>
      
      {/* error message */}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
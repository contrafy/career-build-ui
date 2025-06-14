// src/components/FileUpload.tsx
import { useRef, useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, CheckCircle, FileText, Eye, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { showError } from "./ErrorBanner";

export type UploadKind = "resume" | "cover-letter" | "cv";

interface Props {
  kind: UploadKind;
  /** Called only for résumé uploads when backend returns filter JSON */
  onParsed?: (payload: any) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Visual state machine */
type UploadState = "idle" | "uploading" | "success" | "saved" | "error";

/** Map button state → shadcn variant */
type ButtonVariant = "default" | "secondary" | "destructive" | "success";

const endpointByKind: Record<UploadKind, string | null> = {
  resume: "/api/test_llm_resume_parsing",
  "cover-letter": null,
  cv: "/api/test_llm_resume_parsing",
};

const iconByState: Record<UploadState, LucideIcon> = {
  idle: Upload,
  uploading: Loader2,
  success: CheckCircle,
  saved: Eye,
  error: FileText,
};

const variantByState: Record<UploadState, ButtonVariant> = {
  idle: "secondary",
  uploading: "secondary",
  success: "success",
  saved: "secondary",
  error: "destructive",
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function FileUpload({ kind, onParsed }: Props) {
  const kindLabel = kind === "cover-letter" ? "cover letter" : "résumé";

  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [savedFile, setSavedFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Object‑URL for live preview
  const pdfUrl = useMemo(() => (savedFile ? URL.createObjectURL(savedFile) : ""), [savedFile]);
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  // ─────────────────────────── upload logic ────────────────────────────
  async function sendFile(file: File) {
    setUploadState("uploading");

    try {
      const endpoint = endpointByKind[kind];
      if (endpoint) {
        const fd = new FormData();
        fd.append(kind, file, file.name);
        const res = await fetch(endpoint, { method: "POST", body: fd });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        onParsed?.(data);
      }

      setSavedFile(file);
      setUploadState("success");
      setTimeout(() => setUploadState("saved"), 1200);
    } catch (e: any) {
      showError(e.message ?? "Upload failed");
      setUploadState("error");
    }
  }

  const handleChange = (files: FileList | null) => {
    if (!files?.[0]) return;
    if (files[0].type !== "application/pdf") {
      showError("Please upload a PDF");
      setUploadState("error");
      return;
    }
    sendFile(files[0]);
  };

  // ─────────────────────────── render helpers ──────────────────────────
  const copyByState: Record<UploadState, string> = {
    idle: `Upload ${kindLabel} (PDF)`,
    uploading: "Processing…",
    success: "Success!",
    saved: `View ${kindLabel}`,
    error: "Try again",
  };

  const Icon = iconByState[uploadState];

  const handleClick = () => {
    if (uploadState === "saved") {
      setDialogOpen(true);
    } else if (uploadState !== "uploading") {
      fileInput.current?.click();
    }
  };

  // ───────────────────────────── JSX ───────────────────────────────────
  return (
    <div className="flex flex-col items-center space-y-2">
      <Input
        ref={fileInput}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleChange(e.target.files)}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={uploadState}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, duration: 0.25 }}
        >
          <Button
            size="lg"
            variant={variantByState[uploadState]}
            onClick={handleClick}
            className={cn("px-8 py-4 text-lg", uploadState === "uploading" && "cursor-not-allowed opacity-80")}
            disabled={uploadState === "uploading"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={uploadState}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <Icon className="mr-2 h-5 w-5" />
                {copyByState[uploadState]}
              </motion.span>
            </AnimatePresence>
          </Button>
        </motion.div>
      </AnimatePresence>

      {savedFile && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <span className="sr-only">View {kindLabel}</span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>Your uploaded {kindLabel}</DialogTitle>
            </DialogHeader>
            <div className="w-full h-[80vh]">
              {pdfUrl ? (
                <iframe title={`${kindLabel} preview`} src={pdfUrl} className="w-full h-full rounded-md shadow-inner border" />
              ) : (
                <p>Unable to preview file.</p>
              )}
            </div>
            <DialogClose asChild>
              <Button variant="secondary" className="mt-4 w-full sm:w-auto">
                Close
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

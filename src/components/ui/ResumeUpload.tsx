// src/components/ui/ResumeUpload.tsx
import { useRef, useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, CheckCircle, FileText, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface Props {
  /** Called when the backend responds */
  onParsed?: (payload: any) => void;
}

/** States the upload button can be in */
type UploadState = "idle" | "uploading" | "success" | "saved" | "error";

/* "choose file → POST /api/resume" widget with animations */
export default function ResumeUpload({ onParsed }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [savedFile, setSavedFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // URL for displaying the PDF; revoked on unmount / when file changes
  const pdfUrl = useMemo(() => {
    if (!savedFile) return "";
    return URL.createObjectURL(savedFile);
  }, [savedFile]);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

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

      // save file then show success → saved
      setSavedFile(file);
      setUploadState("success");
      setTimeout(() => setUploadState("saved"), 1200);
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
        <Upload className="mr-2 h-5 w-5" /> Upload résumé (PDF)
      </>
    ),
    uploading: (
      <>
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing…
      </>
    ),
    success: (
      <>
        <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> Success!
      </>
    ),
    saved: (
      <>
        <Eye className="mr-2 h-5 w-5" /> View résumé
      </>
    ),
    error: (
      <>
        <FileText className="mr-2 h-5 w-5" /> Try again
      </>
    ),
  } as const;

  // determine click behaviour based on current state
  const handleClick = () => {
    if (uploadState === "saved") {
      setDialogOpen(true);
    } else if (uploadState === "uploading") {
      return; // ignore
    } else {
      fileInput.current?.click();
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-6 space-y-2">
      {/* hidden real <input> */}
      <Input
        ref={fileInput}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleChange(e.target.files)}
      />

      {/* animated button */}
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
            onClick={handleClick}
            className={cn(
              "flex items-center px-8 py-4 text-lg",
              uploadState === "uploading" && "cursor-not-allowed opacity-80",
              uploadState === "success" && "bg-green-600 hover:bg-green-700",
              uploadState === "saved" && "bg-primary/90 hover:bg-primary"
            )}
            disabled={uploadState === "uploading"}
          >
            {/* fade/slide content transition */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={uploadState}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                {buttonContent[uploadState]}
              </motion.span>
            </AnimatePresence>
          </Button>
        </motion.div>
      </AnimatePresence>

      {/* error message */}
      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* résumé viewer dialog */}
      {savedFile && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            {/* hidden trigger so shadcn handles focus trapping; we already have custom button */}
            <span className="sr-only">View résumé</span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>Your uploaded résumé</DialogTitle>
            </DialogHeader>
            <div className="w-full h-[80vh]">
              {pdfUrl ? (
                <iframe
                  title="résumé preview"
                  src={pdfUrl}
                  className="w-full h-full rounded-md shadow-inner border"
                />
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

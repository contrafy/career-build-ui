// src/components/ui/JobGrid.tsx
import { useMemo } from "react";
import type { FC } from "react";

import { AnimatePresence, motion } from "framer-motion";
import JobCard from "./JobCard";
import type { JobListing } from "./JobCard";

import { FileSearch } from "lucide-react";

interface Props {
  items: JobListing[];
}

/**
 * Responsive grid of <JobCard/>s. When the items list is empty **after** a
 * successful backend call, we show a friendly animated placeholder that nudges
 * the user to broaden their filters.
 */
const JobGrid: FC<Props> = ({ items }) => {
  // newest‑first sort (date_posted → date_created fallback)
  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.date_posted ?? b.date_created ?? 0).getTime() -
          new Date(a.date_posted ?? a.date_created ?? 0).getTime()
      ),
    [items]
  );

  /* ──────────────────────────────── Empty state ───────────────────────────── */
  if (sorted.length === 0) {
    return (
      <section className="mx-auto max-w-4xl py-20 flex flex-col items-center text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
        >
          <FileSearch className="h-16 w-16 text-muted-foreground" />
        </motion.div>
        <h2 className="text-xl font-semibold">No results found</h2>
        <p className="text-sm text-muted-foreground">
          Try expanding your search filters.
        </p>
      </section>
    );
  }

  /* ─────────────────────────────── Populated grid ─────────────────────────── */
  return (
    <section className="mx-auto max-w-6xl p-4 grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
      <AnimatePresence>
        {sorted.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </AnimatePresence>
    </section>
  );
};

export default JobGrid;

import { FC, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import JobCard, { JobListing } from "./JobCard";

interface Props {
    items: JobListing[];
}

// Render responsive grid: use a Tailwind auto‑fill CSS grid for flexible
// columns, wrap the map inside <AnimatePresence> so cards animate on add/remove,
// and delegate each record to <JobCard> for the individual presentation.
const JobGrid: FC<Props> = ({ items }) => {
    const sorted = useMemo(
        () =>
            [...items].sort(
                (a, b) =>
                    new Date(b.date_posted ?? b.date_created ?? 0).getTime() -
                    new Date(a.date_posted ?? a.date_created ?? 0).getTime()
            ),
        [items]
    );

    // Return markup: centre the grid container, apply responsive gaps/columns,
    // and animate mounting/unmounting of each <JobCard> via <AnimatePresence>.
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

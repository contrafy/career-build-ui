import type { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Briefcase, MapPin } from "lucide-react";

// ── Types & props ────────────────────────────────────────────────────────────────
// Define the shape of a job object the component expects, declare the props
// interface, and immediately pull key fields out of the incoming `job` prop for
// easy use throughout the component.
export interface JobListing {
    id: string;
    title?: string;
    organization?: string;
    locations_derived?: string[];
    location_type?: string | null;
    url?: string;
    date_posted?: string;
    date_created?: string;
}

interface Props {
    job: JobListing;
}

// ── Component render ─────────────────────────────────────────────────────────────
// Derive a human‑readable location, then render the job card:
// • `motion.div` → fade/slide animation on mount/unmount.
// • shadcn `Card` layout with title, company, location (with icons).
// • Optional “View posting →” link shown only when a URL exists.
const JobCard: FC<Props> = ({ job }) => {
    // Extract key fields from the job object and compute a fallback-friendly
    // `location` string: prefer the first parsed location; otherwise show "Remote"
    // for telecommute roles or a dash if nothing is available.
    const {
        title,
        organization,
        locations_derived,
        location_type,
        url,
    } = job;

    const location =
        location_type === "TELECOMMUTE" ? "Remote" : locations_derived?.length ? locations_derived[0] : "-";

    return (
        // Animated card markup: applies a quick fade‑in / slide‑up via Framer Motion,
        // wraps content in a shadcn Card, and prints title, company, location, plus a
        // conditional “View posting” link—styled and spaced with Tailwind utility
        // classes for a clean, responsive look.
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="w-full h-full rounded-2xl shadow-lg hover:shadow-xl transition">
                <CardContent className="p-6 flex flex-col gap-3">
                    <h3 className="text-lg font-semibold leading-tight">
                        {title ?? "Untitled role"}
                    </h3>

                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase size={16} /> {organization ?? "Unknown company"}
                    </p>

                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin size={16} /> {location}
                    </p>

                    {url && (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-block text-sm font-medium underline hover:no-underline"
                        >
                            View posting →
                        </a>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default JobCard;

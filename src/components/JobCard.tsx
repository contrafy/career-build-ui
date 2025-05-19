// src/components/JobCard.tsx
import type { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Briefcase, MapPin } from "lucide-react";

export interface JobListing {
    id: string;
    title?: string;
    organization?: string;
    locations_derived?: string[];
    location_type?: string | null;
    url?: string;
    date_posted?: string;
    date_created?: string;
    rating?: number;            // ← the real LLM rating, if/when you add it
}

interface Props {
    job: JobListing;
}

const getRatingColor = (r: number) => {
    if (r <= 3.3) return "text-red-500";
    if (r <= 6.6) return "text-yellow-500";
    return "text-green-500";
};

const JobCard: FC<Props> = ({ job }) => {
    // Pull rating out, but treat null *and* undefined the same (change later)
    const ratingValue = job.rating ?? 7.6;

    const colorClass = getRatingColor(ratingValue);     // ← change ratingValue to job.rating later

    const {
        title,
        organization,
        locations_derived,
        location_type,
        url,
    } = job;
    const location =
        location_type === "TELECOMMUTE"
            ? "Remote"
            : locations_derived?.length
                ? locations_derived[0]
                : "-";

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
        >
            {/* Make this container relative so the badge can sit inside it */}
            <Card className="relative w-full h-full rounded-2xl shadow-lg hover:shadow-xl transition">
                <CardContent className="p-6 flex flex-col gap-3">
                    {/* Always render the badge (fallback to constant until job.rating arrives) */}
                    <div className="absolute top-4 right-4">
                        <span className={`${colorClass}`}>
                            {ratingValue.toFixed(1)}
                        </span>
                    </div>

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

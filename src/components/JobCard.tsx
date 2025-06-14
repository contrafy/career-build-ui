// src/components/JobCard.tsx
import type { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Briefcase, MapPin } from "lucide-react";

// 
export interface JobListing {
    id: string;
    title?: string;
    organization?: string;
    locations_derived?: string[];
    location_type?: string | null;
    url?: string;
    date_posted?: string;
    date_created?: string;
    rating?: number;
}

interface Props {
    job: JobListing;
}

// Color class based on rating thresholds
const getRatingColor = (r: number) => {
    if (r <= 3.3) return "text-red-500";
    if (r <= 6.6) return "text-yellow-500";
    return "text-green-500";
};

const JobCard: FC<Props> = ({ job }) => {
    const ratingValue = job.rating ?? 7.6;
    const colorClass = getRatingColor(ratingValue);

    // Circle arc calculations
    const radius = 14;
    const circumference = 2 * Math.PI * radius;
    const arcLength = circumference * (120 / 360);                
    const filledLength = (ratingValue / 10) * arcLength;

    const {
        title,
        organization,
        locations_derived,
        location_type,
        url,
    } = job;
    // Determine display location
    const location =
        location_type === "TELECOMMUTE"
            ? "Remote"
            : locations_derived?.length
                ? locations_derived[0]
                : "-";

    return (
        <motion.div
            className="overflow-visible"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="relative w-full h-full rounded-2xl shadow-lg hover:shadow-xl transition overflow-visible">
                <CardContent className="p-8 flex flex-col gap-3 overflow-visible">
                    {/* Rating circle and value */}
                    <div className="absolute top-1 right-4 flex flex-col items-center z-20">
                        <svg width="32" height="32" viewBox="0 0 32 32" className="mb-1" style={{ overflow: "visible" }}>
                            <circle
                                cx="16" cy="16" r={radius}
                                fill="none"
                                stroke="#4A4A4A"
                                strokeWidth="2"
                                strokeDasharray={`${arcLength} ${circumference}`}
                                transform="rotate(210 20 30)"          
                            />
                            <circle
                                cx="16" cy="16" r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray={`${filledLength} ${circumference}`}
                                strokeLinecap="round"
                                transform="rotate(210 20 30)"          
                                className={colorClass}
                            />
                        </svg>
                        <span className={`${colorClass} font-semibold`}>
                            {ratingValue.toFixed(1)}
                        </span>
                    </div>

                    {/* Job listing details */}
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

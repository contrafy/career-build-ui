// src/components/FiltersForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import KeywordBucket from "./KeywordBucket";

// Mirrors backend query parameters
export interface JobFilters {
    title: string;
    advancedTitle: string;
    description: string;
    location: string;
    remote: boolean | null;
    roleType: "FT" | "YC" | "INTERN" | "ADZUNA";
    limit: number | null;
}

interface Props {
    value: JobFilters;
    onSubmit: (next: JobFilters) => void;
}

export default function FiltersForm({ value, onSubmit }: Props) {
    // Draft form values
    const [draft, setDraft] = useState<JobFilters>(value);
    // Parsed keyword lists
    const [titleKeywords, setTitleKeywords] = useState<string[]>([])
    const [locationKeywords, setLocationKeywords] = useState<string[]>([])

    // Update draft and keyword arrays when parent value changes
    useEffect(() => {
        setDraft(value);

        const titles = value.advancedTitle
            ? value.advancedTitle.split("|").map(s => s.trim()).filter(Boolean)
            : [];
        setTitleKeywords(titles);

        const locs = value.location
            ? value.location.split(" OR ").map(s => s.trim()).filter(Boolean)
            : [];
        setLocationKeywords(locs);
    }, [value]);

    // Helper to update a single field in draft
    const update =
        <K extends keyof JobFilters>(k: K, v: JobFilters[K]) =>
            setDraft(prev => ({ ...prev, [k]: v }));

    return (
        <form
            className="mb-6 flex flex-wrap gap-5"
            onSubmit={e => {
                e.preventDefault();
                // Reconstruct filters from keywords
                const advancedTitle = titleKeywords.join("|");
                const location = locationKeywords.join(" OR ");

                const next: JobFilters = {
                    ...draft,
                    advancedTitle,
                    location,
                };

                onSubmit(next);
            }}
        >
            {/* Keyword inputs */}
            <KeywordBucket
                initial={[]}
                placeholder="Title keywords…"
                onChange={setTitleKeywords}
            />
            <KeywordBucket
                initial={[]}
                placeholder="Location keywords…"
                onChange={setLocationKeywords}
            />

            {/* Remote / On-site selector */}
            <div className="flex flex-col gap-2">
                <Select
                    value={draft.remote === null ? "any" : draft.remote ? "true" : "false"}
                    onValueChange={v => update("remote", v === "any" ? null : v === "true")}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Remote?" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="true">Remote</SelectItem>
                        <SelectItem value="false">On-site</SelectItem>
                    </SelectContent>
                </Select>
                <Label
                    htmlFor="remote-select"
                    className="pl-2 text-xs font-medium leading-none text-muted-foreground"
                >Remote / On-Site</Label>
            </div>

            {/* Role type selector (resets limit on change) */}
            <div className="flex flex-col gap-2">
                <Select
                    value={draft.roleType}
                    onValueChange={v => {
                        update("roleType", v as JobFilters["roleType"]);
                        update("limit", null);
                    }}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Role type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FT">Full-time</SelectItem>
                        <SelectItem value="YC">Y Combinator</SelectItem>
                        <SelectItem value="INTERN">Internships</SelectItem>
                        <SelectItem value="ADZUNA">Adzuna</SelectItem>
                    </SelectContent>
                </Select>
                <Label
                    htmlFor="roleType-select"
                    className="pl-2 text-xs font-medium leading-none text-muted-foreground"
                >Role Type</Label>
            </div>

            <Button type="submit" className="w-[100px]">Search</Button>
        </form>
    );
}
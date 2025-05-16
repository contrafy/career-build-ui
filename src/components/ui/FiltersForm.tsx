// src/FiltersForm.tsx
//
// A presentational form that just calls `onSubmit()` with the draft filters.
// We use shadcn/ui primitives so styling matches the rest of your cards.

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// --- Types that mirror the eventual query params --------------------------- //
export interface JobFilters {
    title: string;
    description: string;
    location: string;
    remote: boolean | null;
    roleType: "ALL" | "FT" | "YC" | "INTERN";
    limit: number | null
}

interface Props {
    // Parent passes its current filter snapshot
    value: JobFilters;
    // Parent receives the draft when the user presses <Apply>
    onSubmit: (next: JobFilters) => void;
}

export default function FiltersForm({ value, onSubmit }: Props) {
    // Keep a local draft so we’re not spamming state on every keystroke
    const [draft, setDraft] = useState<JobFilters>(value);

    /** Tiny helper that updates one field in the draft object */
    const update =
        <K extends keyof JobFilters>(key: K, val: JobFilters[K]) =>
            setDraft(prev => ({ ...prev, [key]: val }));
    
    /** returns the dropdown options that make sense for the current roleType */
    const limitOptions = useMemo(() => {
        switch (draft.roleType) {
            case "FT": return [30, 50, 100];
            case "YC":
            case "INTERN": return [10, 20, 30, 40, 50];
            default: return [];            // ALL → hidden
        }
    }, [draft.roleType]);

    const showLimit = draft.roleType !== "ALL";

    return (
        <form
            className="mb-6 flex flex-wrap gap-4"
            onSubmit={e => {
                e.preventDefault();   // stay on-page
                onSubmit(draft);      // lift draft to parent (does nothing for now)
            }}
        >
            <Input
                placeholder="Title Keywords (e.g. Data Engineer)"
                value={draft.title}
                onChange={e => update("title", e.target.value)}
                className="flex-1 min-w-[200px]"
            />

            <Input
                placeholder="Desc. Keywords (e.g. Python OR MySQL)"
                value={draft.description}
                onChange={e => update("description", e.target.value)}
                className="flex-1 min-w-[200px]"
            />

            <Input
                placeholder="Location "
                value={draft.location}
                onChange={e => update("location", e.target.value)}
                className="flex-1 min-w-[160px]"
            />

            <Select
                value={draft.remote === null ? "any" : draft.remote ? "true" : "false"}
                onValueChange={(v) =>
                    update("remote", v === "any" ? null : v === "true")
                }
            >
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="On-Site / Remote" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="true">Remote</SelectItem>
                    <SelectItem value="false">On-site</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={draft.roleType}
                onValueChange={(v) => {
                    update("roleType", v as JobFilters["roleType"]);
                    update("limit", null);
                }}
            >
                {/* Button-like control that shows the current choice */}
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Role type" />
                </SelectTrigger>

                {/* Dropdown panel that **provides the context** */}
                <SelectContent>
                    <SelectItem value="ALL">All roles</SelectItem>
                    <SelectItem value="FT">Full-time</SelectItem>
                    <SelectItem value="YC">Y Combinator</SelectItem>
                    <SelectItem value="INTERN">Internships</SelectItem>
                </SelectContent>
            </Select>

            {showLimit && (
                <Select
                    value={String(draft.limit ?? limitOptions[0])}
                    onValueChange={(v) => update("limit", Number(v))}
                >
                    <SelectTrigger className="w-[100px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {limitOptions.map((n) => (
                            <SelectItem key={n} value={String(n)}>
                                {n}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Button type="submit">Apply</Button>
        </form>
    );
}

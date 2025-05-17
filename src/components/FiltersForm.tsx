// src/FiltersForm.tsx
//
// A presentational form that just calls `onSubmit()` with the draft filters.
// We use shadcn/ui primitives so styling matches the rest of your cards.

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SharedFiltersForm from "./SharedFiltersForm";
import InternFiltersForm from "./InternFiltersForm";
import FTFiltersForm from "./FTFiltersForm";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

// --- Types that mirror the eventual query params --------------------------- //
export interface JobFilters {
    // ───────────── Shared ────────────────────────────────────────────────────
    title: string;
    advancedTitle: string;
    description: string;
    location: string;
    remote: boolean | null;
    roleType: "FT" | "YC" | "INTERN";
    limit: number | null;

    // ───────────── FT & Internships ──────────────────────────────────────────
    includeAI: boolean;
    aiWork: string | null;                // On-site / Hybrid / Remote OK / Remote Solely

    // ───────────── Internships only ─────────────────────────────────────────
    agency: boolean;

    // ───────────── Full-time only ────────────────────────────────────────────
    org: string;
    source: string;
    aiEmployment: string;         // FULL_TIME / PART_TIME / …
    aiHasSalary: boolean | null;
    aiExperience: string | null;          // 0-2 / 2-5 / 5-10 / 10+
    aiVisa: boolean | null;
    includeLI: boolean;
    liOrg: string;
    liOrgExclude: string;
    liIndustry: string;
    liSpec: string;
    liOrgDesc: string;
}

interface Props {
    value: JobFilters;
    onSubmit: (next: JobFilters) => void;
}

export default function FiltersForm({ value, onSubmit }: Props) {
    const [draft, setDraft] = useState<JobFilters>(value);
    useEffect(() => setDraft(value), [value]);

    const update =
        <K extends keyof JobFilters>(k: K, v: JobFilters[K]) =>
            setDraft(prev => ({ ...prev, [k]: v }));

    return (
        <form
            className="mb-6 flex flex-wrap gap-4"
            onSubmit={e => { e.preventDefault(); onSubmit(draft); }}
        >
            {/* ───── Always-visible shared fields ───── */}
            <SharedFiltersForm draft={draft} update={update} />

            {/* ───── Role-specific extras ───────────── */}
            {/* Remove for now */}
            {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">More&nbsp;filters</Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="p-4 min-w-[26rem]">
                    {draft.roleType === "INTERN" && (
                        <InternFiltersForm draft={draft} update={update} />
                    )}

                    {draft.roleType === "FT" && (
                        <FTFiltersForm draft={draft} update={update} />
                    )}

                    {draft.roleType === "YC" && (
                        <p className="text-sm text-muted-foreground">
                            No additional filters for this role type.
                        </p>
                    )}
                </DropdownMenuContent>
            </DropdownMenu> */}

            <Button type="submit">Apply</Button>
        </form>
    );
  }
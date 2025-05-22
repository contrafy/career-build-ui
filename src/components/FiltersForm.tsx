// src/FiltersForm.tsx
//
// A presentational form that just calls `onSubmit()` with the draft filters.
// We use shadcn/ui primitives so styling matches the rest of your cards.

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import TemplateSelect from "./TemplateSelect";
import KeywordBucket from "./KeywordBucket";
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
    const [pendingKeywords, setPendingKeywords] = useState<string[]>([])
    
    useEffect(() => {
        setDraft(value)
        // reset bucket if you like:
        setPendingKeywords([])
    }, [value])

    const update =
        <K extends keyof JobFilters>(k: K, v: JobFilters[K]) =>
            setDraft(prev => ({ ...prev, [k]: v }));

    return (
        <form
            className="mb-6 flex flex-wrap gap-5"
            onSubmit={(e) => {
                e.preventDefault()
                // only now do we merge bucket into your draft (if you ever want to)
                onSubmit(draft)
            }}
        >
            <div className="flex gap-2 w-full">
                <Input
                    placeholder="Advanced title keywords…"
                    value={draft.advancedTitle}
                    onChange={e => update("advancedTitle", e.target.value)}
                    className="flex-1"
                />
                <TemplateSelect
                    value={draft.advancedTitle}
                    onSelect={query => update("advancedTitle", query)}
                />
            </div>

            <KeywordBucket
                initial={[]}           // start empty
                onChange={setPendingKeywords}
            />

            <Input
                placeholder="Description keywords…"
                value={draft.description}
                onChange={e => update("description", e.target.value)}
                className="flex-1 min-w-[200px]"
            />

            <Input
                placeholder="Location"
                value={draft.location}
                onChange={e => update("location", e.target.value)}
                className="flex-1 min-w-[160px]"
            />

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

            <div className="flex flex-col gap-2">
                <Select
                    value={draft.roleType}
                    onValueChange={v => {                      // reset limit on change
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
                    </SelectContent>
                </Select>
                <Label
                    htmlFor="roleType-select"
                    className="pl-2 text-xs font-medium leading-none text-muted-foreground"
                >Role Type</Label>
            </div>

            <Button type="submit" className="w-[100px]">Search</Button>

            {/* ───── Always-visible shared fields ───── */}
            {/* Remove for now />*/}
            {/* <SharedFiltersForm draft={draft} update={update} />*/}

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
        </form>
    );
}
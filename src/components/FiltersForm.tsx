// src/FiltersForm.tsx
//
// A presentational form that just calls `onSubmit()` with the draft filters.
// We use shadcn/ui primitives so styling matches the rest of your cards.

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import KeywordBucket from "./KeywordBucket";

import { fetchJobs } from "@/lib/api";
import type { JobListing } from "./JobCard";

// --- Types that mirror the eventual query params --------------------------- //
export interface JobFilters {
    // ───────────── Shared ────────────────────────────────────────────────────
    title: string;
    advancedTitle: string;
    description: string;
    location: string;
    remote: boolean | null;
    roleType: "FT" | "YC" | "INTERN" | "ADZUNA";
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
    /** Fields the résumé doesn’t touch (remote / roleType / etc.) */
    baseFilters: JobFilters;

    /** Initial keyword lists from résumé parsing */
    initialTitleKeywords?: string[];
    initialLocationKeywords?: string[];

    /** Update parent when search finishes */
    onSearchComplete: (jobs: JobListing[] | null, error?: string) => void;

    /** Let parent show/hide spinner */
    setLoading: (b: boolean) => void;
}

export default function FiltersForm({
                                baseFilters,
                                initialTitleKeywords,
                                initialLocationKeywords,
                                onSearchComplete,
                                setLoading,
                                }: Props) {
    /** Local copy of the non‑keyword fields (remote, roleType, …) */
    const [draft, setDraft] = useState<JobFilters>(baseFilters);
    const [titleKeywords, setTitleKeywords] = useState<string[]>(initialTitleKeywords ?? [])
    const [locationKeywords, setLocationKeywords] = useState<string[]>(initialLocationKeywords ?? [])

    
    // Keep local non‑keyword fields in sync with parent
    useEffect(() => { setDraft(baseFilters); }, [baseFilters]);

    // refresh buckets **only** when résumé seeds change
    useEffect(() => {
        if (initialTitleKeywords) setTitleKeywords(initialTitleKeywords);
    }, [initialTitleKeywords]);

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

    const update =
        <K extends keyof JobFilters>(k: K, v: JobFilters[K]) =>
            setDraft(prev => ({ ...prev, [k]: v }));

    // ——— helper: fire the API call ————————————————————————
    const doSearch = async (filters: JobFilters) => {
        console.log("doSearch", filters);
        setLoading(true);
        try {
            const jobs = await fetchJobs(filters);
            onSearchComplete(jobs);
        } catch (err: any) {
            onSearchComplete(null, err?.message ?? "Network error");
        }
    };

    return (
        <form
            className="mb-6 flex flex-wrap gap-5"
            onSubmit={e => {
                e.preventDefault();
                const advancedTitle = titleKeywords.join("|");
                const location = locationKeywords.join(" OR ");

                const next: JobFilters = {
                    ...draft,
                    advancedTitle,
                    location,
                };

                doSearch(next);
            }}
        >
            <KeywordBucket
                initial={titleKeywords}
                placeholder="Title keywords…"
                onChange={setTitleKeywords}
            />
            <KeywordBucket
                initial={locationKeywords}
                placeholder="Location keywords…"
                onChange={setLocationKeywords}
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
                        <SelectItem value="ADZUNA">Adzuna</SelectItem>
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
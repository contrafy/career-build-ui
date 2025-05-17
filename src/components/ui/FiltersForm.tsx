// src/FiltersForm.tsx
//
// A presentational form that just calls `onSubmit()` with the draft filters.
// We use shadcn/ui primitives so styling matches the rest of your cards.

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// --- Types that mirror the eventual query params --------------------------- //
export interface JobFilters {
    // ───────────── Shared ────────────────────────────────────────────────────
    title: string;
    description: string;
    location: string;
    remote: boolean | null;
    roleType: "ALL" | "FT" | "YC" | "INTERN";
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
    aiExperience: string;          // 0-2 / 2-5 / 5-10 / 10+
    aiVisa: boolean | null;
    includeLI: boolean;
    liOrg: string;
    liOrgExclude: string;
    liIndustry: string;
    liSpec: string;
    liOrgDesc: string;
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

    useEffect(() => {
        setDraft(value);
    }, [value]);

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
    const showAIFields = draft.roleType === "FT" || draft.roleType === "INTERN";
    const showInternOnly = draft.roleType === "INTERN";
    const showFTOnly = draft.roleType === "FT";

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

            {/* ───────────── AI-enriched (FT + Intern) ─────────────────────────── */}
            {showAIFields && (
                <>
                    <Checkbox
                        checked={draft.includeAI}
                        onCheckedChange={c => update("includeAI", !!c)}
                    />
                    <span className="mr-4">Include AI fields</span>

                    <Select
                        value={draft.aiWork == null ? "any" : draft.aiWork}
                        onValueChange={v => update("aiWork", v)}
                    >
                        <SelectTrigger className="w-[170px]">
                            <SelectValue placeholder="AI work arrangement" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="On-site">On-site</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                            <SelectItem value="Remote OK">Remote OK</SelectItem>
                            <SelectItem value="Remote Solely">Remote Solely</SelectItem>
                        </SelectContent>
                    </Select>
                </>
            )}

            {/* ───────────── Internship-only fields ────────────────────────────── */}
            {showInternOnly && (
                <>
                    <Checkbox
                        checked={draft.agency}
                        onCheckedChange={c => update("agency", !!c)}
                    />
                    <span className="mr-4">Only agencies / job boards</span>
                </>
            )}

            {/* ───────────── Full-time-only fields ─────────────────────────────── */}
            {showFTOnly && (
                <>
                    <Input
                        placeholder="Organization slug"
                        value={draft.org}
                        onChange={e => update("org", e.target.value)}
                        className="flex-1 min-w-[160px]"
                    />

                    <Input
                        placeholder="Source"
                        value={draft.source}
                        onChange={e => update("source", e.target.value)}
                        className="flex-1 min-w-[120px]"
                    />

                    <Select
                        value={draft.aiEmployment == null ? "any" : draft.aiEmployment}
                        onValueChange={v => update("aiEmployment", v)}
                    >
                        <SelectTrigger className="w-[170px]">
                            <SelectValue placeholder="Employment type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            {["FULL_TIME", "PART_TIME", "CONTRACTOR", "TEMPORARY",
                                "INTERN", "VOLUNTEER", "PER_DIEM", "OTHER"].map(t =>
                                    <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select
                        value={draft.aiHasSalary === null ? "any" : draft.aiHasSalary ? "yes" : "no"}
                        onValueChange={v => update("aiHasSalary", v === "any" ? null : v === "yes")}
                    >
                        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Has salary?" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={draft.aiExperience == null ? "any" : draft.aiExperience}
                        onValueChange={v => update("aiExperience", v)}
                    >
                        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Experience" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            {["0-2", "2-5", "5-10", "10+"].map(e =>
                                <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select
                        value={draft.aiVisa === null ? "any" : draft.aiVisa ? "yes" : "no"}
                        onValueChange={v => update("aiVisa", v === "any" ? null : v === "yes")}
                    >
                        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Visa sponsor?" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={draft.includeLI === null ? "any" : draft.includeLI ? "yes" : "no"}
                        onValueChange={v => update("includeLI", v === "any" ? null : v === "yes")}
                    >
                        <SelectTrigger className="w-[150px]"><SelectValue placeholder="LinkedIn data?" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="any">Any</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* LinkedIn-detail filters */}
                    <Input placeholder="li_org…" value={draft.liOrg}
                        onChange={e => update("liOrg", e.target.value)}
                        className="flex-1 min-w-[140px]" />
                    <Input placeholder="li_org_exclude…" value={draft.liOrgExclude}
                        onChange={e => update("liOrgExclude", e.target.value)}
                        className="flex-1 min-w-[140px]" />
                    <Input placeholder="li_industry…" value={draft.liIndustry}
                        onChange={e => update("liIndustry", e.target.value)}
                        className="flex-1 min-w-[140px]" />
                    <Input placeholder="li_specialties…" value={draft.liSpec}
                        onChange={e => update("liSpec", e.target.value)}
                        className="flex-1 min-w-[140px]" />
                    <Input placeholder="li_description…" value={draft.liOrgDesc}
                        onChange={e => update("liOrgDesc", e.target.value)}
                        className="flex-1 min-w-[140px]" />
                </>
            )}

            <Button type="submit">Apply</Button>
        </form>
    );
}

// FTFiltersForm.tsx
//
// Extra filters that apply **only** when roleType === "FT".

import {
    Input
} from "@/components/ui/input";
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { JobFilters } from "@/components/FiltersForm";

interface Props {
    draft: JobFilters;
    update: <K extends keyof JobFilters>(k: K, v: JobFilters[K]) => void;
}

export default function FTFiltersForm({ draft, update }: Props) {
    return (
        <div className="flex flex-wrap gap-4">
            {/* ───── AI shared with internships ───── */}
            <Checkbox
                checked={draft.includeAI}
                onCheckedChange={c => update("includeAI", !!c)}
            />
            <span className="mr-4">Include AI fields</span>

            <Select
                value={draft.aiWork ?? "any"}
                onValueChange={v => update("aiWork", v === "any" ? null : v)}
            >
                <SelectTrigger className="w-[160px]">
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

            {/* ───── Full-time specific fields ───── */}
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
                value={draft.aiEmployment || "any"}
                onValueChange={v => update("aiEmployment", v === "any" ? "" : v)}
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
                value={draft.aiHasSalary === null ? "any" : draft.aiHasSalary ? "true" : "false"}
                onValueChange={v => update("aiHasSalary", v === "any" ? null : v === "true")}
            >
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Has salary?" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={draft.aiExperience || "any"}
                onValueChange={v => update("aiExperience", v === "any" ? "" : v)}
            >
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Experience" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    {["0-2", "2-5", "5-10", "10+"].map(e =>
                        <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select
                value={draft.aiVisa === null ? "any" : draft.aiVisa ? "true" : "false"}
                onValueChange={v => update("aiVisa", v === "any" ? null : v === "true")}
            >
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Visa sponsor?" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                </SelectContent>
            </Select>

            <Checkbox
                checked={draft.includeLI}
                onCheckedChange={c => update("includeLI", !!c)}
            />
            <span className="mr-4">Include LinkedIn data</span>

            {/* LinkedIn detail filters */}
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
        </div>
    );
}
  
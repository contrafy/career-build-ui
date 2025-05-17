// InternFiltersForm.tsx
//
// Extra filters that apply **only** when roleType === "INTERN".

import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { JobFilters } from "@/components/ui/FiltersForm";

interface Props {
    draft: JobFilters;
    update: <K extends keyof JobFilters>(k: K, v: JobFilters[K]) => void;
}

export default function InternFiltersForm({ draft, update }: Props) {
    return (
        <div className="flex flex-wrap gap-4">
            {/* shared with FT → includeAI + aiWork */}
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

            {/* internship-only */}
            <Checkbox
                checked={draft.agency}
                onCheckedChange={c => update("agency", !!c)}
            />
            <span>Only recruitment agencies / boards</span>
        </div>
    );
}
  
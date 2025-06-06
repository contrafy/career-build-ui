// SharedFiltersForm.tsx
//
// Base filters that are shown for every roleType.
// No <form>, no <Button>; caller wraps these controls.

import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import TemplateSelect from "./TemplateSelect";
import { Input } from "@/components/ui/input";
import type { JobFilters } from "@/components/FiltersForm";
import { Label } from "@/components/ui/label";

interface Props {
    draft: JobFilters;
    update: <K extends keyof JobFilters>(k: K, v: JobFilters[K]) => void;
}

export default function SharedFiltersForm({ draft, update }: Props) {
    return (
        <div className="flex flex-wrap gap-4">
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
        </div>
    );
}

import * as React from "react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";

import { FILTER_TEMPLATES } from "@/constants/filterTemplates";

interface Props {
    /* current advancedTitle value (so we can show the active template’s label) */
    value: string;
    /* stick the template’s query into the parent form state */
    onSelect: (query: string) => void;
}

export default function TemplateSelect({ value, onSelect }: Props) {
    const [open, setOpen] = React.useState(false);

    // Find a label that matches the current query (so the button shows something nice)
    const selected = React.useMemo(
        () => FILTER_TEMPLATES.find(t => t.query === value)?.label ?? "Templates",
        [value]
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="min-w-[160px] justify-between"
                >
                    {selected}
                    <ChevronsUpDown size={16} className="ml-2 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="p-0 w-[360px]">
                <Command>
                    <CommandInput placeholder="Search templates…" />
                    <CommandList>
                        <CommandEmpty>No template found.</CommandEmpty>

                        {FILTER_TEMPLATES.map(t => (
                            <CommandItem
                                key={t.label}
                                onSelect={() => {
                                    onSelect(t.query); // push query into form
                                    setOpen(false);
                                }}
                            >
                                {t.label}
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

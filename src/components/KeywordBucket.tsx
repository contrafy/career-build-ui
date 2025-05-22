// src/components/KeywordBucket.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function KeywordBucket() {
    const [inputValue, setInputValue] = useState("");
    const [keywords, setKeywords] = useState<string[]>([]);

    const addKeyword = () => {
        const kw = inputValue.trim();
        if (kw && !keywords.includes(kw)) {
            setKeywords([...keywords, kw]);
            setInputValue("");
        }
    };

    const removeKeyword = (kw: string) => {
        setKeywords(keywords.filter(k => k !== kw));
    };

    return (
        <div className="flex-1 min-w-[200px]">
            <div className="relative">
                <Input
                    placeholder="Add keyword…"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="w-full pr-16"
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                />
                <Button
                    size="sm"
                    onClick={addKeyword}
                    className="absolute top-1/2 right-1.5 -translate-y-1/2"
                >
                    Add
                </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
                {keywords.map(kw => (
                    <Badge key={kw} className="inline-flex items-center gap-1">
                        {kw}
                        <button
                            onClick={() => removeKeyword(kw)}
                            aria-label={`Remove ${kw}`}
                            className="text-xs leading-none"
                        >
                            ×
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
}

// src/components/KeywordBucket.tsx
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Props {
    initial?: string[]
    placeholder?: string
    onChange?: (keywords: string[]) => void
}

export default function KeywordBucket({ initial = [], placeholder, onChange }: Props) {
    const [input, setInput] = useState("")
    const [keywords, setKeywords] = useState<string[]>(initial)

    // keep internal state in sync when parent changes `initial`
    useEffect(() => {
        setKeywords(initial);
    }, [initial]);

    // whenever our local keywords change, notify parent
    useEffect(() => {
        onChange?.(keywords)
    }, [keywords, onChange])

    const add = () => {
        const kw = input.trim()
        if (!kw || keywords.includes(kw)) return
        setKeywords([...keywords, kw])
        setInput("")
    }

    const remove = (kw: string) => {
        setKeywords(keywords.filter(k => k !== kw))
    }

    return (
        <div className="flex-1 min-w-[200px]">
            <div className="relative">
                <Input
                    placeholder={placeholder ?? "Add keyword…"}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
                    className="w-full pr-16"
                />
                <Button
                    type="button"
                    size="sm"
                    onClick={add}
                    className="absolute top-1/2 right-1.5 -translate-y-1/2"
                >
                    Add
                </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
                {keywords.map(kw => (
                    <Badge key={kw} className="inline-flex items-center gap-1">
                        {kw}
                        <button
                            onClick={() => remove(kw)}
                            aria-label={`Remove ${kw}`}
                            className="text-xs leading-none"
                        >
                            x
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    )
}

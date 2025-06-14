// src/components/UserSettings.tsx
import { useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UserSettings({ open, onOpenChange }: Props) {
    // Local state for each API key input
    const [rapidKey, setRapidKey] = useState("");
    const [openAIKey, setOpenAIKey] = useState("");
    const [groqKey, setGroqKey] = useState("");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Invisible trigger; dialog opened programmatically */}
            <DialogTrigger asChild>
                <span className="sr-only">Open settings</span>
            </DialogTrigger>

            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>API Keys</DialogTitle>
                </DialogHeader>

                {/* API key inputs */}
                <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col">
                        <Label htmlFor="rapid-api-key">RapidAPI Key</Label>
                        <Input
                            id="rapid-api-key"
                            value={rapidKey}
                            onChange={(e) => setRapidKey(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <Label htmlFor="openai-key">OpenAI Key</Label>
                        <Input
                            id="openai-key"
                            value={openAIKey}
                            onChange={(e) => setOpenAIKey(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <Label htmlFor="groq-key">Groq Key</Label>
                        <Input
                            id="groq-key"
                            value={groqKey}
                            onChange={(e) => setGroqKey(e.target.value)}
                        />
                    </div>
                </div>

                {/* Close dialog and save inputs */}
                <DialogClose asChild>
                    <Button variant="secondary" className="w-full">
                        Save
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}

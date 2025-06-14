// src/components/UserProfile.tsx
import { useAuth } from "./AuthContainer";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UserProfile({ open, onOpenChange }: Props) {
    const { user } = useAuth();
    if (!user) return null; // If no user, don't render anything

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Trigger exists for accessibility */}
            <DialogTrigger asChild>
                <span className="sr-only">Open profile</span>
            </DialogTrigger>

            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Your Profile</DialogTitle>
                </DialogHeader>

                {/* User avatar and info */}
                <div className="flex flex-col items-center gap-4 p-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user.picture} />
                        <AvatarFallback className="text-3xl">
                            {user.name[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="text-center">
                        <p className="text-lg font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                <DialogClose asChild>
                    <Button variant="secondary" className="w-full">
                        Close
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}

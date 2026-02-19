"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateScore } from "@/hooks/use-matches";

interface UpdateScoreDialogProps {
    matchId: number;
    homeTeam: string;
    awayTeam: string;
    currentHomeScore: number;
    currentAwayScore: number;
}

export function UpdateScoreDialog({
    matchId,
    homeTeam,
    awayTeam,
    currentHomeScore,
    currentAwayScore,
}: UpdateScoreDialogProps) {
    const [open, setOpen] = useState(false);
    const [homeScore, setHomeScore] = useState(currentHomeScore);
    const [awayScore, setAwayScore] = useState(currentAwayScore);
    const updateScore = useUpdateScore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateScore.mutate(
            { matchId, data: { homeScore, awayScore } },
            {
                onSuccess: () => {
                    setOpen(false);
                },
            },
        );
    };

    // Sync local state when dialog opens with latest props
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setHomeScore(currentHomeScore);
            setAwayScore(currentAwayScore);
        }
        setOpen(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    id="update-score-button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5">
                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                        <path d="m15 5 4 4" />
                    </svg>
                    Update Score
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Score</DialogTitle>
                    <DialogDescription>Set the current score for this match.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="homeScore"
                                className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {homeTeam}
                            </Label>
                            <Input
                                id="homeScore"
                                type="number"
                                min={0}
                                value={homeScore}
                                onChange={(e) => setHomeScore(Number(e.target.value))}
                                className="text-center text-2xl font-semibold tabular-nums h-14"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="awayScore"
                                className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {awayTeam}
                            </Label>
                            <Input
                                id="awayScore"
                                type="number"
                                min={0}
                                value={awayScore}
                                onChange={(e) => setAwayScore(Number(e.target.value))}
                                className="text-center text-2xl font-semibold tabular-nums h-14"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={updateScore.isPending}
                            className="w-full sm:w-auto">
                            {updateScore.isPending ? "Updating…" : "Save Score"}
                        </Button>
                    </DialogFooter>
                </form>
                {updateScore.isError && (
                    <p className="text-xs text-destructive text-center mt-2">
                        {updateScore.error instanceof Error
                            ? updateScore.error.message
                            : "Failed to update score"}
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}

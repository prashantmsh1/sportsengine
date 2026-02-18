"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateMatch } from "@/hooks/use-matches";
import { toast } from "sonner";

const SPORTS = [
    "Football",
    "Cricket",
    "Basketball",
    "Tennis",
    "Baseball",
    "Hockey",
    "Rugby",
    "Volleyball",
];

export function CreateMatchDialog() {
    const [open, setOpen] = useState(false);
    const [sport, setSport] = useState("");
    const [homeTeam, setHomeTeam] = useState("");
    const [awayTeam, setAwayTeam] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const createMatch = useCreateMatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!sport || !homeTeam || !awayTeam || !startTime || !endTime) {
            toast.error("Please fill in all required fields");
            return;
        }

        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        if (endDate <= startDate) {
            toast.error("End time must be after start time");
            return;
        }

        try {
            await createMatch.mutateAsync({
                sport,
                homeTeam,
                awayTeam,
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
            });

            toast.success("Match created successfully!");
            setOpen(false);
            resetForm();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create match");
        }
    };

    const resetForm = () => {
        setSport("");
        setHomeTeam("");
        setAwayTeam("");
        setStartTime("");
        setEndTime("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 text-sm">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Match
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg">Create Match</DialogTitle>
                    <DialogDescription className="text-sm">
                        Set up a new match with teams and schedule.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="sport" className="text-xs">
                            Sport
                        </Label>
                        <Select value={sport} onValueChange={setSport}>
                            <SelectTrigger id="sport" className="h-9">
                                <SelectValue placeholder="Select sport" />
                            </SelectTrigger>
                            <SelectContent>
                                {SPORTS.map((s) => (
                                    <SelectItem key={s} value={s.toLowerCase()}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="homeTeam" className="text-xs">
                                Home Team
                            </Label>
                            <Input
                                id="homeTeam"
                                placeholder="e.g. Manchester United"
                                value={homeTeam}
                                onChange={(e) => setHomeTeam(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="awayTeam" className="text-xs">
                                Away Team
                            </Label>
                            <Input
                                id="awayTeam"
                                placeholder="e.g. Liverpool"
                                value={awayTeam}
                                onChange={(e) => setAwayTeam(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="startTime" className="text-xs">
                                Start Time
                            </Label>
                            <Input
                                id="startTime"
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="endTime" className="text-xs">
                                End Time
                            </Label>
                            <Input
                                id="endTime"
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="h-9"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={createMatch.isPending}>
                            {createMatch.isPending ? "Creating..." : "Create Match"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

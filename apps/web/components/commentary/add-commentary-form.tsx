"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateCommentary } from "@/hooks/use-commentary";
import { toast } from "sonner";

const EVENT_TYPES = [
    { value: "general", label: "💬 General" },
    { value: "goal", label: "⚽ Goal" },
    { value: "card", label: "🟨 Card" },
    { value: "substitution", label: "🔄 Substitution" },
    { value: "foul", label: "⚠️ Foul" },
    { value: "corner", label: "📐 Corner" },
    { value: "offside", label: "🚩 Offside" },
    { value: "penalty", label: "🎯 Penalty" },
    { value: "kickoff", label: "▶️ Kickoff" },
    { value: "halftime", label: "⏸️ Halftime" },
    { value: "fulltime", label: "🏁 Full Time" },
    { value: "var", label: "📺 VAR Review" },
];

interface AddCommentaryFormProps {
    matchId: number;
    homeTeam?: string;
    awayTeam?: string;
}

export function AddCommentaryForm({ matchId, homeTeam, awayTeam }: AddCommentaryFormProps) {
    const [minute, setMinute] = useState("");
    const [eventType, setEventType] = useState("general");
    const [team, setTeam] = useState("");
    const [actor, setActor] = useState("");
    const [message, setMessage] = useState("");
    const [period, setPeriod] = useState("");

    const createCommentary = useCreateCommentary(matchId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            toast.error("Message is required");
            return;
        }

        try {
            await createCommentary.mutateAsync({
                minute: parseInt(minute) || 0,
                eventType: eventType || undefined,
                team: team || undefined,
                actor: actor || undefined,
                message: message.trim(),
                period: period || undefined,
            });

            toast.success("Commentary added!");
            setMessage("");
            setActor("");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to add commentary");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Add Commentary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="space-y-1">
                    <Label htmlFor="minute" className="text-[11px] text-muted-foreground/70">
                        Minute
                    </Label>
                    <Input
                        id="minute"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={minute}
                        onChange={(e) => setMinute(e.target.value)}
                        className="h-8 text-sm"
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="eventType" className="text-[11px] text-muted-foreground/70">
                        Event
                    </Label>
                    <Select value={eventType} onValueChange={setEventType}>
                        <SelectTrigger id="eventType" className="h-8 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EVENT_TYPES.map((et) => (
                                <SelectItem key={et.value} value={et.value}>
                                    {et.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="team" className="text-[11px] text-muted-foreground/70">
                        Team
                    </Label>
                    <Select value={team} onValueChange={setTeam}>
                        <SelectTrigger id="team" className="h-8 text-sm">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {homeTeam && <SelectItem value={homeTeam}>{homeTeam}</SelectItem>}
                            {awayTeam && <SelectItem value={awayTeam}>{awayTeam}</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="period" className="text-[11px] text-muted-foreground/70">
                        Period
                    </Label>
                    <Input
                        id="period"
                        placeholder="1st Half"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="h-8 text-sm"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <Label htmlFor="actor" className="text-[11px] text-muted-foreground/70">
                    Player / Actor
                </Label>
                <Input
                    id="actor"
                    placeholder="e.g. Lionel Messi"
                    value={actor}
                    onChange={(e) => setActor(e.target.value)}
                    className="h-8 text-sm"
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor="message" className="text-[11px] text-muted-foreground/70">
                    Message *
                </Label>
                <Textarea
                    id="message"
                    placeholder="Describe what happened..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    className="resize-none text-sm"
                />
            </div>

            <Button
                type="submit"
                size="sm"
                disabled={createCommentary.isPending || !message.trim()}
                className="w-full">
                {createCommentary.isPending ? "Adding..." : "Add Commentary"}
            </Button>
        </form>
    );
}

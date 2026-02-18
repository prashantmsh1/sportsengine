"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CommentaryFeed } from "@/components/commentary/commentary-feed";
import { AddCommentaryForm } from "@/components/commentary/add-commentary-form";
import { useMatches } from "@/hooks/use-matches";
import { format } from "@/lib/date-utils";

function getStatusConfig(status: string) {
    switch (status) {
        case "live":
            return {
                label: "Live",
                className: "bg-primary/10 text-primary border-primary/20 animate-pulse-soft",
            };
        case "finished":
            return {
                label: "Finished",
                className: "bg-muted text-muted-foreground border-border/50",
            };
        default:
            return {
                label: "Upcoming",
                className: "bg-chart-3/10 text-chart-3 border-chart-3/20",
            };
    }
}

export default function MatchDetailPage() {
    const params = useParams();
    const matchId = Number(params.id);
    const { data, isLoading } = useMatches();

    const match = data?.data.find((m) => m.id === matchId);

    if (isLoading) {
        return (
            <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-44 rounded-xl" />
                <Skeleton className="h-80 rounded-xl" />
            </div>
        );
    }

    if (!match) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <p className="text-lg font-medium">Match not found</p>
                <p className="text-sm text-muted-foreground mt-1">
                    This match doesn&apos;t exist or has been removed.
                </p>
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mt-4">
                        ← Back to Matches
                    </Button>
                </Link>
            </div>
        );
    }

    const statusConfig = getStatusConfig(match.status);

    return (
        <div className="space-y-8 max-w-3xl mx-auto animate-fade-in">
            {/* Back button */}
            <Link href="/">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 -ml-2 text-sm text-muted-foreground hover:text-foreground">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Matches
                </Button>
            </Link>

            {/* Match header */}
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 sm:p-8">
                {/* Top row */}
                <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
                        {match.sport}
                    </span>
                    <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 ${statusConfig.className}`}>
                        {statusConfig.label}
                    </Badge>
                </div>

                {/* Score area */}
                <div className="flex items-center justify-center gap-6 sm:gap-8 mb-6">
                    <div className="text-center flex-1">
                        <p className="text-base sm:text-lg font-semibold">{match.homeTeam}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5 uppercase tracking-wider">
                            Home
                        </p>
                    </div>

                    <div className="flex items-baseline gap-3 px-5 py-2.5 rounded-xl bg-muted/30">
                        <span className="text-3xl sm:text-4xl font-semibold tabular-nums">
                            {match.homeScore}
                        </span>
                        <span className="text-lg text-muted-foreground/30 font-light">:</span>
                        <span className="text-3xl sm:text-4xl font-semibold tabular-nums">
                            {match.awayScore}
                        </span>
                    </div>

                    <div className="text-center flex-1">
                        <p className="text-base sm:text-lg font-semibold">{match.awayTeam}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5 uppercase tracking-wider">
                            Away
                        </p>
                    </div>
                </div>

                {/* Time info */}
                <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground/60">
                    <span>{format(match.startTime)}</span>
                    {match.endTime && (
                        <>
                            <span className="text-muted-foreground/20">→</span>
                            <span>{format(match.endTime)}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Commentary section */}
            <div className="space-y-5">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Commentary
                    </h2>
                    <div className="flex-1 h-px bg-border/30" />
                </div>

                <AddCommentaryForm
                    matchId={matchId}
                    homeTeam={match.homeTeam}
                    awayTeam={match.awayTeam}
                />

                <CommentaryFeed matchId={matchId} />
            </div>
        </div>
    );
}

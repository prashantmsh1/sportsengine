"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Match } from "@/lib/types";
import { formatDistanceToNow, format } from "@/lib/date-utils";

function getStatusConfig(status: string) {
    switch (status) {
        case "live":
            return {
                label: "Live",
                className: "bg-primary/10 text-primary border-primary/20",
                dotClass: "bg-primary animate-pulse-soft",
            };
        case "finished":
            return {
                label: "Finished",
                className: "bg-muted text-muted-foreground border-border/50",
                dotClass: "bg-muted-foreground/50",
            };
        case "scheduled":
        default:
            return {
                label: "Upcoming",
                className: "bg-chart-3/10 text-chart-3 border-chart-3/20",
                dotClass: "bg-chart-3",
            };
    }
}

export function MatchCard({ match }: { match: Match }) {
    const statusConfig = getStatusConfig(match.status);

    return (
        <Link href={`/matches/${match.id}`}>
            <div className="group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 transition-all duration-200 hover:border-border hover:bg-card/80 cursor-pointer">
                {/* Status line */}
                {match.status === "live" && (
                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                )}

                {/* Top row */}
                <div className="flex items-center justify-between mb-5">
                    <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
                        {match.sport}
                    </span>
                    <Badge
                        variant="outline"
                        className={`text-[10px] font-medium px-2 py-0.5 ${statusConfig.className}`}>
                        <span
                            className={`mr-1.5 h-1 w-1 rounded-full inline-block ${statusConfig.dotClass}`}
                        />
                        {statusConfig.label}
                    </Badge>
                </div>

                {/* Score area */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 text-right">
                        <p className="text-sm font-medium truncate text-foreground/80 group-hover:text-foreground transition-colors">
                            {match.homeTeam}
                        </p>
                    </div>

                    <div className="flex items-baseline gap-2 px-3 py-1 rounded-lg bg-muted/40">
                        <span className="text-xl font-semibold tabular-nums">
                            {match.homeScore}
                        </span>
                        <span className="text-muted-foreground/40 text-sm font-light">:</span>
                        <span className="text-xl font-semibold tabular-nums">
                            {match.awayScore}
                        </span>
                    </div>

                    <div className="flex-1">
                        <p className="text-sm font-medium truncate text-foreground/80 group-hover:text-foreground transition-colors">
                            {match.awayTeam}
                        </p>
                    </div>
                </div>

                {/* Bottom row */}
                <div className="mt-5 flex items-center justify-between text-[11px] text-muted-foreground/60">
                    <span>{format(match.startTime)}</span>
                    <span>{formatDistanceToNow(match.startTime)}</span>
                </div>
            </div>
        </Link>
    );
}

"use client";

import { useMatches } from "@/hooks/use-matches";
import { MatchCard } from "./match-card";
import { Skeleton } from "@/components/ui/skeleton";

export function MatchList() {
    const { data, isLoading, isError, error } = useMatches();

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="rounded-full bg-destructive/10 p-3 mb-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-6 w-6 text-destructive">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
                <p className="text-sm font-medium">Failed to load matches</p>
                <p className="text-xs text-muted-foreground mt-1">
                    {error instanceof Error ? error.message : "Something went wrong"}
                </p>
            </div>
        );
    }

    const matches = data?.data ?? [];

    if (matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="rounded-full bg-muted p-3 mb-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-6 w-6 text-muted-foreground">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10" />
                        <path d="M2 12h20" />
                    </svg>
                </div>
                <p className="text-sm font-medium">No matches yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Create your first match to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
            ))}
        </div>
    );
}

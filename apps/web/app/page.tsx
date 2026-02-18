"use client";

import { MatchList } from "@/components/matches/match-list";
import { CreateMatchDialog } from "@/components/matches/create-match-dialog";

export default function DashboardPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero section */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Matches</h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                        Live scores and real-time commentary.
                    </p>
                </div>
                <CreateMatchDialog />
            </div>

            {/* Match grid */}
            <MatchList />
        </div>
    );
}

"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useCommentary } from "@/hooks/use-commentary";
import { useWebSocket } from "@/hooks/use-websocket";
import { CommentaryItem } from "./commentary-item";
import { Skeleton } from "@/components/ui/skeleton";

export function CommentaryFeed({ matchId }: { matchId: number }) {
    const { data, isLoading, isError } = useCommentary(matchId, 100);
    const { subscribeToMatch, unsubscribeFromMatch, isConnected } = useWebSocket();
    const [newIds, setNewIds] = useState<Set<number>>(new Set());
    const prevCountRef = useRef(0);

    // Subscribe to match commentary via WebSocket
    useEffect(() => {
        if (isConnected && matchId) {
            subscribeToMatch(matchId);
            return () => {
                unsubscribeFromMatch(matchId);
            };
        }
    }, [isConnected, matchId, subscribeToMatch, unsubscribeFromMatch]);

    // Track newly arrived commentary items
    const commentaries = useMemo(() => data?.commentry ?? [], [data]);
    useEffect(() => {
        if (commentaries.length > prevCountRef.current && prevCountRef.current > 0) {
            const newItems = commentaries.slice(0, commentaries.length - prevCountRef.current);
            const ids = new Set(newItems.map((c) => c.id));
            setNewIds(ids);
            const timeout = setTimeout(() => setNewIds(new Set()), 2000);
            return () => clearTimeout(timeout);
        }
        prevCountRef.current = commentaries.length;
    }, [commentaries]);

    if (isLoading) {
        return (
            <div className="space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-8 text-sm text-muted-foreground/60">
                Failed to load commentary
            </div>
        );
    }

    if (commentaries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                <div className="rounded-full bg-muted/50 p-2.5 mb-2.5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="h-5 w-5 text-muted-foreground/50">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
                <p className="text-xs text-muted-foreground/60">No commentary yet</p>
                <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                    Add the first entry above.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {commentaries.map((c) => (
                <CommentaryItem key={c.id} commentary={c} isNew={newIds.has(c.id)} />
            ))}
        </div>
    );
}

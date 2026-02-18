"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { getCommentary, createCommentary } from "@/lib/api";
import type { CreateCommentaryInput } from "@/lib/types";

export function useCommentary(matchId: number, limit?: number) {
    return useQuery({
        queryKey: ["commentary", matchId, limit],
        queryFn: () => getCommentary(matchId, limit),
        enabled: !!matchId,
    });
}

export function useCreateCommentary(matchId: number) {
    return useMutation({
        mutationFn: (data: CreateCommentaryInput) => createCommentary(matchId, data),
        // No onSuccess invalidation needed — the WebSocket broadcast
        // updates the cache directly via setQueriesData for all clients
    });
}

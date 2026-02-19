"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMatches, createMatch, updateScore } from "@/lib/api";
import type { CreateMatchInput, UpdateScoreInput } from "@/lib/types";

export function useMatches(limit?: number) {
    return useQuery({
        queryKey: ["matches", limit],
        queryFn: () => getMatches(limit),
    });
}

export function useCreateMatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMatchInput) => createMatch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
    });
}

export function useUpdateScore() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ matchId, data }: { matchId: number; data: UpdateScoreInput }) =>
            updateScore(matchId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
    });
}

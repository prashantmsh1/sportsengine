import type {
    MatchesResponse,
    CreateMatchInput,
    CreateMatchResponse,
    CommentaryResponse,
    CreateCommentaryInput,
    CreateCommentaryResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Generic Fetch Wrapper ─────────────────────────────────────────────────────

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody?.message || errorBody?.error || `API error: ${res.status}`);
    }

    return res.json();
}

// ─── Matches API ───────────────────────────────────────────────────────────────

export async function getMatches(limit?: number): Promise<MatchesResponse> {
    const params = limit ? `?limit=${limit}` : "";
    return apiFetch<MatchesResponse>(`/matches${params}`);
}

export async function createMatch(data: CreateMatchInput): Promise<CreateMatchResponse> {
    return apiFetch<CreateMatchResponse>("/matches", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// ─── Commentary API ────────────────────────────────────────────────────────────

export async function getCommentary(matchId: number, limit?: number): Promise<CommentaryResponse> {
    const params = limit ? `?limit=${limit}` : "";
    return apiFetch<CommentaryResponse>(`/matches/${matchId}/commentry${params}`);
}

export async function createCommentary(
    matchId: number,
    data: CreateCommentaryInput,
): Promise<CreateCommentaryResponse> {
    return apiFetch<CreateCommentaryResponse>(`/matches/${matchId}/commentry`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// ─── Match Types ───────────────────────────────────────────────────────────────

export type MatchStatus = "scheduled" | "live" | "finished";

export interface Match {
    id: number;
    sport: string;
    homeTeam: string;
    awayTeam: string;
    status: MatchStatus;
    startTime: string;
    endTime: string | null;
    homeScore: number;
    awayScore: number;
    createdAt: string;
}

export interface CreateMatchInput {
    sport: string;
    homeTeam: string;
    awayTeam: string;
    startTime: string;
    endTime: string;
    homeScore?: number;
    awayScore?: number;
}

export interface UpdateScoreInput {
    homeScore: number;
    awayScore: number;
}

// ─── Commentary Types ──────────────────────────────────────────────────────────

export interface Commentary {
    id: number;
    matchId: number;
    minute: number | null;
    sequence: number | null;
    period: string | null;
    eventType: string | null;
    actor: string | null;
    team: string | null;
    message: string | null;
    metadata: Record<string, unknown> | null;
    tags: string[] | null;
    createdAt: string;
}

export interface CreateCommentaryInput {
    minute: number;
    sequence?: number;
    period?: string;
    eventType?: string;
    actor?: string;
    team?: string;
    message: string;
    metadata?: Record<string, unknown>;
    tags?: string[];
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface MatchesResponse {
    data: Match[];
}

export interface CreateMatchResponse {
    message: string;
    match: Match;
}

export interface UpdateScoreResponse {
    message: string;
    match: Match;
}

export interface CommentaryResponse {
    message: string;
    commentry: Commentary[];
}

export interface CreateCommentaryResponse {
    message: string;
    commentary: Commentary;
}

// ─── WebSocket Types ───────────────────────────────────────────────────────────

export type WSMessageType =
    | "welcome"
    | "subscribed"
    | "unsubscribed"
    | "match_created"
    | "score_updated"
    | "comment"
    | "error";

export interface WSMessage {
    type: WSMessageType;
    matchId?: string;
    match?: Match;
    data?: Commentary;
    message?: string;
}

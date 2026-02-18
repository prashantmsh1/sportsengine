"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { WSMessage, Commentary, CommentaryResponse } from "@/lib/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5000/ws";
const RECONNECT_INTERVAL = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

interface WebSocketContextValue {
    isConnected: boolean;
    sendMessage: (data: Record<string, unknown>) => void;
    subscribeToMatch: (matchId: number) => void;
    unsubscribeFromMatch: (matchId: number) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
    const connectRef = useRef<(() => void) | null>(null);
    const queryClient = useQueryClient();
    const [isConnected, setIsConnected] = useState(false);

    // Track active subscriptions so we can re-subscribe on reconnect
    const activeSubscriptions = useRef<Set<string>>(new Set());

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        try {
            const ws = new WebSocket(WS_URL);

            ws.onopen = () => {
                setIsConnected(true);
                reconnectAttempts.current = 0;
                console.log("[WS] Connected");

                // Re-subscribe to all active matches on reconnect
                activeSubscriptions.current.forEach((matchId) => {
                    ws.send(JSON.stringify({ type: "subscribe", matchId }));
                });
            };

            ws.onmessage = (event) => {
                try {
                    const message: WSMessage = JSON.parse(event.data);

                    switch (message.type) {
                        case "match_created":
                            queryClient.invalidateQueries({ queryKey: ["matches"] });
                            break;

                        case "comment":
                            if (message.data) {
                                const commentary = message.data as Commentary;
                                // Directly inject into cache — no API refetch needed
                                queryClient.setQueriesData<CommentaryResponse>(
                                    { queryKey: ["commentary", commentary.matchId] },
                                    (old) => {
                                        if (!old) return old;
                                        const exists = old.commentry.some(
                                            (c) => c.id === commentary.id,
                                        );
                                        if (exists) return old;
                                        return {
                                            ...old,
                                            commentry: [commentary, ...old.commentry],
                                        };
                                    },
                                );
                            }
                            break;

                        case "welcome":
                            console.log("[WS] Welcome received");
                            break;

                        case "subscribed":
                            console.log(`[WS] Subscribed to match ${message.matchId}`);
                            break;

                        case "unsubscribed":
                            console.log(`[WS] Unsubscribed from match ${message.matchId}`);
                            break;

                        case "error":
                            console.error("[WS] Server error:", message.message);
                            break;
                    }
                } catch {
                    console.error("[WS] Failed to parse message");
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
                wsRef.current = null;
                console.log("[WS] Disconnected");

                if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                    reconnectTimer.current = setTimeout(() => {
                        reconnectAttempts.current++;
                        console.log(
                            `[WS] Reconnecting (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})...`,
                        );
                        connectRef.current?.();
                    }, RECONNECT_INTERVAL);
                }
            };

            ws.onerror = () => {
                console.error("[WS] Connection error");
            };

            wsRef.current = ws;
        } catch (err) {
            console.error("[WS] Failed to connect:", err);
        }
    }, [queryClient]);

    useEffect(() => {
        connectRef.current = connect;
    }, [connect]);

    const sendMessage = useCallback((data: Record<string, unknown>) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        }
    }, []);

    const subscribeToMatch = useCallback(
        (matchId: number) => {
            const id = String(matchId);
            activeSubscriptions.current.add(id);
            sendMessage({ type: "subscribe", matchId: id });
        },
        [sendMessage],
    );

    const unsubscribeFromMatch = useCallback(
        (matchId: number) => {
            const id = String(matchId);
            activeSubscriptions.current.delete(id);
            sendMessage({ type: "unsubscribe", matchId: id });
        },
        [sendMessage],
    );

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connect]);

    const value: WebSocketContextValue = {
        isConnected,
        sendMessage,
        subscribeToMatch,
        unsubscribeFromMatch,
    };

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket(): WebSocketContextValue {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a <WebSocketProvider>");
    }
    return context;
}

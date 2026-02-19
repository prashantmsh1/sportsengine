import { WebSocket, WebSocketServer } from "ws";
import { Server, IncomingMessage } from "http";
import { Match as MatchType } from "@repo/database";
import { arcjet } from "../configs/arcjet";
import { Duplex } from "stream";
import { json } from "zod";

// Extended WebSocket interface with isAlive for heartbeat
export interface ExtendedWebSocket extends WebSocket {
    isAlive: boolean;
    subscriptions: Set<string>;
}

interface MessagePayload {
    type: string;
    message: string;
}
const matchSubscribers = new Map<string, Set<WebSocket>>();

export const subscribeToMatch = (matchId: string, ws: WebSocket) => {
    if (!matchSubscribers.has(matchId)) {
        matchSubscribers.set(matchId, new Set());
    }
    matchSubscribers.get(matchId)?.add(ws);
};

export const unsubscribeToMatch = (matchId: string, ws: WebSocket) => {
    const subscribers = matchSubscribers.get(matchId);
    if (!subscribers) {
        return;
    }
    subscribers.delete(ws);
    if (subscribers.size === 0) {
        matchSubscribers.delete(matchId);
    }
};

export const cleanupSubscription = (ws: ExtendedWebSocket) => {
    for (const matchId of ws.subscriptions) {
        unsubscribeToMatch(matchId, ws);
    }
};

export const broadcastToMatch = (matchId: string, data: any) => {
    const subscribers = matchSubscribers.get(matchId);
    if (!subscribers) {
        return;
    }
    const message = JSON.stringify(data);
    subscribers.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) sendJson(ws, data);
    });
};

export const sendJson = (ws: WebSocket, data: any) => {
    if (ws.readyState !== WebSocket.OPEN) {
        return;
    }
    ws.send(JSON.stringify(data));
};

export const broadcastToAll = (wss: WebSocketServer, data: any) => {
    wss.clients.forEach((client) => {
        if (client.readyState !== WebSocket.OPEN) {
            return;
        }
        sendJson(client, data);
    });
};

export const handleMessage = (ws: ExtendedWebSocket, data: MessagePayload) => {
    let message;

    try {
        message = JSON.parse(data.toString());
    } catch (error) {
        sendJson(ws, {
            type: "error",
            message: "Invalid message",
        });
    }

    switch (message.type) {
        case "subscribe":
            const subMatchId = String(message.matchId);
            subscribeToMatch(subMatchId, ws);
            ws.subscriptions.add(subMatchId);
            sendJson(ws, {
                type: "subscribed",
                matchId: subMatchId,
            });
            break;
        case "unsubscribe":
            const unsubMatchId = String(message.matchId);
            unsubscribeToMatch(unsubMatchId, ws);
            ws.subscriptions.delete(unsubMatchId);
            sendJson(ws, {
                type: "unsubscribed",
                matchId: unsubMatchId,
            });
            break;
        default:
            sendJson(ws, {
                type: "error",
                message: "Invalid message from subscriber",
            });
    }
};

export const attachWebSocketServer = (server: Server) => {
    // Use noServer mode to manually handle upgrades and apply rate limiting
    const wss = new WebSocketServer({
        noServer: true,
        maxPayload: 1024 * 1024,
    });

    // Handle upgrade requests manually to apply Arcjet rate limiting BEFORE connection
    server.on("upgrade", async (request: IncomingMessage, socket: Duplex, head: Buffer) => {
        // Only handle requests to /ws path
        if (request.url !== "/ws") {
            socket.destroy();
            return;
        }

        console.log("[WS] Upgrade request received");

        // Apply Arcjet rate limiting
        if (arcjet.wsArcjet) {
            try {
                // Pass the IncomingMessage as the request
                const decision = await arcjet.wsArcjet.protect(request as any);

                if (decision.isDenied()) {
                    const reason = decision.reason.isRateLimit()
                        ? "Rate limit exceeded"
                        : "Blocked by Arcjet";
                    console.log(`[Arcjet WS] Denied: ${reason}`);

                    // Reject the upgrade with HTTP 429 or 403
                    const statusCode = decision.reason.isRateLimit() ? 429 : 403;
                    socket.write(`HTTP/1.1 ${statusCode} ${reason}\r\n\r\n`);
                    socket.destroy();
                    return;
                }
            } catch (error) {
                console.error("[Arcjet WS] Error:", error);
                socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
                socket.destroy();
                return;
            }
        }

        // Arcjet passed - complete the WebSocket handshake
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request);
        });
    });

    wss.on("connection", (socket: ExtendedWebSocket, request: IncomingMessage) => {
        socket.isAlive = true;
        console.log("[WS] Client connected");

        socket.on("pong", () => {
            socket.isAlive = true;
        });

        socket.subscriptions = new Set();

        sendJson(socket, { type: "welcome" });

        socket.on("message", (message: MessagePayload) => {
            // Handle incoming messages

            handleMessage(socket, message);
        });

        socket.on("error", (error) => {
            console.log("[WS] Client error:", error);
            socket.terminate();
        });

        socket.on("close", () => {
            cleanupSubscription(socket);
        });
    });

    // Heartbeat interval to detect dead connections
    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            const socket = ws as ExtendedWebSocket;
            if (socket.isAlive === false) {
                return socket.terminate();
            }
            socket.isAlive = false;
            socket.ping(() => {});
        });
    }, 30000);

    wss.on("close", () => {
        clearInterval(interval);
    });

    function broadcastMatchCreated(match: MatchType) {
        broadcastToAll(wss, { type: "match_created", match });
    }
    function broadcastCommentry(matchId: string, comment: any) {
        broadcastToMatch(matchId, { type: "comment", data: comment });
    }
    return { broadcastMatchCreated, broadcastCommentry };
};

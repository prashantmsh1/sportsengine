import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { Match as MatchType } from "@repo/database";
import { arcjet } from "../configs/arcjet";
// Add this interface at the top of the file (after imports)
interface ExtendedWebSocket extends WebSocket {
    isAlive: boolean;
}
export const sendJson = (ws: WebSocket, data: any) => {
    if (ws.readyState != WebSocket.OPEN) {
        return;
    }
    ws.send(JSON.stringify(data));
};

export const broadcastJson = (wss: WebSocketServer, data: any) => {
    wss.clients.forEach((client) => {
        if (client.readyState != WebSocket.OPEN) {
            return;
        }
        sendJson(client, data);
    });
};

export const attachWebSocketServer = (server: Server) => {
    const wss = new WebSocketServer({
        server,
        path: "/ws",
        maxPayload: 1024 * 1024,
    });

    wss.on("connection", async (socket: ExtendedWebSocket) => {
        if (arcjet.wsArcjet) {
            try {
                const decision = await arcjet.wsArcjet.protect(socket);
                if (decision?.isDenied()) {
                    const code = decision.reason.isRateLimit() ? 4029 : 1008;
                    const reason = decision.reason.isRateLimit()
                        ? "Rate limit exceeded"
                        : "Blocked by Arcjet";
                    console.log("Arcjet denied", decision);
                    return socket.close(code, reason);
                }
            } catch (error) {
                console.error("Arcjet error", error);
                return socket.close(1008, "Server Security Error");
            }
        }
        socket.isAlive = true;

        socket.on("pong", () => {
            socket.isAlive = true;
        });
        console.log("Client connected");

        sendJson(socket, { type: "welcome" });
        socket.on("message", (message) => {});

        socket.on("error", (error) => {
            console.log("Client error", error);
        });
        socket.on("close", () => {
            console.log("Client disconnected");
        });
    });

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
        broadcastJson(wss, { type: "match_created", match });
    }

    return { broadcastMatchCreated };
};

import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { Match as MatchType } from "@repo/database";
import express from "express";

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

    wss.on("connection", (ws) => {
        console.log("Client connected");

        sendJson(ws, { type: "welcome" });
        ws.on("message", (message) => {});

        ws.on("error", (error) => {
            console.log("Client error", error);
        });
        ws.on("close", () => {
            console.log("Client disconnected");
        });
    });

    function broadcastMatchCreated(match: MatchType) {
        broadcastJson(wss, { type: "match_created", match });
    }

    return { broadcastMatchCreated };
};

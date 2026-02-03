import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Websockets service is running");
});

const server = app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket, request) => {
    console.log("New client connected");
    const ip = request.socket.remoteAddress;
    console.log(ip);
    socket.on("message", (message) => {
        console.log(`Received: ${message}`);
        // socket.send(`Echo: ${message}`);
        const data = message.toString();
        console.log(data);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`Echo: ${data}`);
            }
        });
    });

    socket.on("error", (error) => {
        console.log(`Error: ${error.name}: ${error.message}: ${ip}`);
    });

    socket.on("close", () => {
        console.log(`Client disconnected: ${ip}`);
    });
});

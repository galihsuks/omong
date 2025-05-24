require("dotenv").config();
const express = require("express");
const useragent = require("express-useragent");
const cors = require("cors");
const app = express();
const port = 8081;
const mongoose = require("mongoose");
const roomRoute = require("./app/room/route.js");
const userRoute = require("./app/user/route.js");
const authRoute = require("./app/auth/route.js");
const chatRoute = require("./app/chat/route.js");

app.use(cors());
app.use(express.json());
app.use(useragent.express());

app.get("/api", (req, res) => {
    res.send("API Ngomongo v1");
});

// routes
app.use("/api/auth", authRoute);
app.use("/api/room", roomRoute);
app.use("/api/chat", chatRoute);
app.use("/api/user", userRoute);

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to mongoDB");
        app.listen(port, "0.0.0.0", () => {
            console.log(`Backend Ngomongo app listening on port ${port}`);
        });
    })
    .catch(() => {
        console.log("Connection to mongodb failed");
    });

// =========================

const WebSocket = require("ws");
const { parse } = require("url");
const server = new WebSocket.Server({ port: 4001 });
const rooms = {};

server.on("connection", (socket, req) => {
    const { query } = parse(req.url, true);
    const idroom = query.idroom ? query.idroom : "XXXXX";

    //kalau idroomnya blm ada
    if (!rooms[idroom]) {
        rooms[idroom] = new Set();
    }

    rooms[idroom].add(socket);

    socket.on("message", (message, isBinary) => {
        try {
            const datamya = JSON.parse(message.toString());
            // datanya = {
            //     tipe: ["typing", "chat"],
            //     data: {
            //         typing: {
            //             user_id,
            //             room_id,
            //         },
            //         chat: {
            //             action: ["add", "delete"],
            //             iniIsiDariDatabaseSemuaDanPopulatenya,
            //         },
            //     },
            // };
            rooms[idroom].forEach((client) => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(message.toString());
                }
            });
        } catch (error) {
            console.log(error.message);
        }
    });

    socket.on("close", () => {
        rooms[idroom].delete(socket);
        if (rooms[idroom].size === 0) {
            delete rooms[idroom];
        }
    });
});

console.log("WebSocket server running on ws://localhost:4001");

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

app.get("/backend", (req, res) => {
    res.send("API Ngomongo v1");
});

// routes
app.use("/backend/auth", authRoute);
app.use("/backend/room", roomRoute);
app.use("/backend/chat", chatRoute);
app.use("/backend/user", userRoute);

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
const clients = new Map(); // Map socket => { rooms: Set() }
const rooms = {};
// const user = {};

server.on("connection", (socket, req) => {
    if (!clients.get(socket)) {
        clients.set(socket, {
            rooms: new Set(),
            user: null,
        });
    }

    socket.on("message", (message) => {
        try {
            const parsed = JSON.parse(message.toString());
            const { tipe, data } = parsed;

            const now = new Date();
            const pad = (n) => n.toString().padStart(2, "0");
            const formattedDate = `${pad(now.getDate())}/${pad(
                now.getMonth() + 1
            )}/${now.getFullYear()} ${pad(now.getHours())}:${pad(
                now.getMinutes()
            )}:${pad(now.getSeconds())}`;
            console.log(`========= ${formattedDate} ==========`);
            console.log(parsed);

            // datanya = {
            //     tipe: ["typing", "chat", "seen", "subscribe" , "unsubscribe", "room", "online"],
            //     data: {
            //         typing: {
            //             user_id,
            //             room_id,
            //         },
            //         chat: {
            //             action: ["add", "delete"],
            //             lastchat: null | isi dari data"nya (hanya untuk delete)
            //             chatsUnread: number (hanya untuk delete)
            //             room_id,
            //             data" chat yang ditambahkan (hanya untuk add)
            //         },
            //         seen: {
            //             room_id,
            //             chats: [chat_id],
            //             addToSeenUsers: {
            //                 user: {
            //                     _id,
            //                     nama,
            //                     email,
            //                 },
            //                 timestamp,
            //             }
            //         },
            //         room: {
            //             action: ['add', 'edit'],
            //             users_id: [] array dari email users
            //         },
            //         online: {
            //             email, nama, id, token
            //         }
            //     },
            // };

            switch (tipe) {
                case "online": {
                    const { email, nama, id: iduser, token } = data;
                    clients.get(socket).user = { email, nama, iduser, token };
                    (async () => {
                        const fetchonline = await fetch(
                            `${process.env.BASE_URL_BACKEND}/user/online/1`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                },
                                method: "GET",
                            }
                        );
                        const responseOnline = await fetchonline.json();
                    })();
                    console.log(`${nama} sedang online`);
                    break;
                }
                case "get-online": {
                    break;
                }
                case "subscribe": {
                    const room_id = data.room_id;
                    if (!rooms[room_id]) rooms[room_id] = new Set();
                    rooms[room_id].add(socket);
                    clients.get(socket).rooms.add(room_id);
                    console.log(`Socket subscribed to room ${room_id}`);
                    break;
                }
                case "unsubscribe": {
                    const room_id = data.room_id;
                    rooms[room_id]?.delete(socket);
                    clients.get(socket).rooms.delete(room_id);
                    console.log(`Socket unsubscribed from room ${room_id}`);
                    break;
                }
                case "chat": {
                    const room_id = data.room_id;
                    const msgToSend = JSON.stringify({ tipe, data });
                    rooms[room_id]?.forEach((client) => {
                        if (
                            client !== socket &&
                            client.readyState === WebSocket.OPEN
                        ) {
                            client.send(msgToSend);
                        }
                    });
                    break;
                }
                case "room": {
                    const users_id = data.users_id;
                    const msgToSend = JSON.stringify({ tipe, data });
                    clients.forEach((clientData, clientSocket) => {
                        if (
                            clientSocket !== socket &&
                            clientSocket.readyState === WebSocket.OPEN &&
                            clientData.user &&
                            users_id.includes(clientData.user.iduser)
                        ) {
                            // targetSockets.push(clientSocket);
                            clientSocket.send(msgToSend);
                        }
                    });
                    break;
                    // targetSockets sekarang berisi semua socket yang user.iduser-nya ada di users_id
                    // clients.get
                    // clients.forEach((clientData, clientSocket) => {
                    //     console.log("client Data");
                    //     console.log(clientData);
                    // });
                }
                // case "typing":
                default:
                    console.log("Tipe data tidak dikenal");
                    break;
            }
        } catch (error) {
            console.log(error.message);
        }
    });

    socket.on("close", () => {
        const { rooms: joinedRooms, user } = clients.get(socket) || {};
        joinedRooms?.forEach((roomId) => rooms[roomId]?.delete(socket));
        if (user) {
            console.log("User yang di buat offline");
            console.log(user);
            (async () => {
                const fetchonline = await fetch(
                    `${process.env.BASE_URL_BACKEND}/user/online/0`,
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                        method: "GET",
                    }
                );
                const responseOnline = await fetchonline.json();
            })();
        }
        clients.delete(socket);
        console.log("Client disconnected");
    });
});

console.log("WebSocket server running on ws://localhost:4001");

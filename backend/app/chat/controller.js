require("dotenv").config();
const Chat = require("./model.js");
const Room = require("../room/model.js");
const WebSocket = require("ws");

const addChat = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate(
            "anggota",
            "nama email"
        );

        if (!room) {
            return res.status(404).json({ pesan: "Id room tidak ditemukan" });
        }
        if (room.anggota.filter((a) => a._id == req.user.id).length == 0) {
            return res
                .status(403)
                .json({ pesan: "Anda tidak memiliki akses ke room ini" });
        }
        const data = {
            idRoom: req.params.id,
            pesan: req.body.pesan,
            idPengirim: req.user.id,
            idChatReply: req.body.idChatReply || null,
            seenUsers: [
                {
                    user: req.user.id,
                    timestamp: Date.now(),
                },
            ],
        };
        const chat = new Chat(data);
        await chat.save();

        const chatAdded = await Chat.findById(chat._id)
            .populate("idPengirim", "nama email")
            .populate("seenUsers.user", "nama email")
            .populate({
                path: "idChatReply",
                select: "pesan idPengirim",
                populate: { path: "idPengirim", select: "nama" },
            });
        const chatsUnread = await Chat.find({
            idRoom: req.params.id,
            "seenUsers.user": { $ne: req.user.id },
        });

        const ws = new WebSocket(`${process.env.URL_WS}`);
        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    tipe: "chat",
                    data: {
                        ...chatAdded._doc,
                        action: "add",
                        room_id: chatAdded.idRoom,
                        chatsUnread: chatsUnread.length,
                    },
                }),
                (err) => {
                    res.status(200).json(chatAdded);
                    ws.close();
                }
            );
        };
        ws.onerror = (err) => {
            res.status(400).json({ pesan: "WebSocket error: " + err.message });
        };
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const delChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return res.status(404).json({ pesan: "Id chat tidak ditemukan" });
        }
        if (chat.idPengirim != req.user.id) {
            return res
                .status(404)
                .json({ pesan: "Anda tidak memiliki akses hapus chat ini" });
        }
        const room = await Room.findById(chat.idRoom).populate(
            "anggota",
            "nama email"
        );
        if (!room) {
            return res.status(404).json({ pesan: "Id room tidak ditemukan" });
        }
        if (room.anggota.filter((a) => a._id == req.user.id).length == 0) {
            return res
                .status(404)
                .json({ pesan: "Anda tidak memiliki akses ke room ini" });
        }
        await Chat.findByIdAndDelete(req.params.id);

        const lastchat = await Chat.findOne({ idRoom: chat.idRoom })
            .sort({ createdAt: -1 })
            .populate("idPengirim", "nama email")
            .populate({
                path: "idChatReply",
                select: "pesan idPengirim",
                populate: { path: "idPengirim", select: "nama" },
            })
            .populate("seenUsers.user", "nama email");
        const chatsUnread = await Chat.find({
            idRoom: chat.idRoom,
            "seenUsers.user": { $ne: req.user.id },
        });
        const ws = new WebSocket(`${process.env.URL_WS}`);
        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    tipe: "chat",
                    data: {
                        action: "delete",
                        room_id: chat.idRoom,
                        lastchat,
                        chat_id: req.params.id,
                        chatsUnread: chatsUnread.length,
                    },
                }),
                (err) => {
                    res.status(200).json(chat);
                    ws.close();
                }
            );
        };
        ws.onerror = (err) => {
            res.status(400).json({ pesan: "WebSocket error: " + err.message });
        };
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const seen = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate("anggota", "nama email")
            .populate({
                path: "chats",
                populate: [
                    { path: "idPengirim", select: "nama email" },
                    {
                        path: "idChatReply",
                        select: "pesan idPengirim",
                        populate: { path: "idPengirim", select: "nama" },
                    },
                    {
                        path: "seenUsers.user",
                        select: "nama email",
                    },
                ],
            });
        if (!room) {
            return res.status(404).json({ pesan: "Id room tidak ditemukan" });
        }
        if (room.anggota.filter((a) => a._id == req.user.id).length == 0) {
            return res
                .status(404)
                .json({ pesan: "Anda tidak memiliki akses ke room ini" });
        }

        const timestamp = Date.now();
        const chatsUpdated = await Chat.find({
            idRoom: req.params.id,
            "seenUsers.user": { $ne: req.user.id },
        });
        await Chat.updateMany(
            {
                idRoom: req.params.id,
                "seenUsers.user": { $ne: req.user.id },
            },
            {
                $push: {
                    seenUsers: {
                        user: req.user.id,
                        timestamp,
                    },
                },
            }
        );

        if (chatsUpdated.length === 0) {
            return res.status(200).json({
                room_id: req.params.id,
                chats: [],
                addToSeenUsers: {
                    user: {
                        _id: req.user.id,
                        nama: req.user.nama,
                        email: req.user.email,
                    },
                    timestamp,
                },
            });
        }

        const ws = new WebSocket(
            `${process.env.URL_WS}/?room=${req.params.id}`
        );
        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    tipe: "chat",
                    data: {
                        action: "seen",
                        room_id: req.params.id,
                        //chats yg baru saja dilihat
                        chats: chatsUpdated.map((chat) => {
                            return chat._id;
                        }),
                        addToSeenUsers: {
                            user: {
                                _id: req.user.id,
                                nama: req.user.nama,
                                email: req.user.email,
                            },
                            timestamp,
                        },
                    },
                }),
                (err) => {
                    res.status(200).json({
                        room_id: req.params.id,
                        //chats yg baru saja dilihat
                        chats: chatsUpdated.map((chat) => {
                            return chat._id;
                        }),
                        addToSeenUsers: {
                            user: {
                                _id: req.user.id,
                                nama: req.user.nama,
                                email: req.user.email,
                            },
                            timestamp,
                        },
                    });
                    ws.close();
                }
            );
        };
        ws.onerror = (err) => {
            res.status(400).json({ pesan: "WebSocket error: " + err.message });
        };
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

const one = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

module.exports = {
    addChat,
    delChat,
    seen,
    one,
};

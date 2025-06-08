const Room = require("./model.js");
const User = require("../user/model.js");
const Chat = require("../chat/model.js");
const WebSocket = require("ws");

const getRoom = async (req, res) => {
    try {
        const { id } = req.params;
        if (id) {
            let room = await Room.findById(id)
                .populate("anggota", "nama email online")
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
                return res
                    .status(404)
                    .json({ pesan: "Id room tidak ditemukan" });
            }
            if (room.anggota.filter((a) => a._id == req.user.id).length == 0) {
                return res
                    .status(400)
                    .json({ pesan: "Anda tidak memiliki akses ke room ini" });
            }
            if (room.tipe == "private") {
                room = {
                    ...room._doc,
                    nama: room.anggota.filter((a) => a._id != req.user.id)[0]
                        .nama,
                };
            }
            return res.status(200).json(room);
        }
        let rooms = await Room.find({
            anggota: { $all: [req.user.id] },
        })
            .sort({ updatedAt: -1 })
            .populate("anggota", "nama email online");
        let roomsFix = [];
        for (let i = 0; i < rooms.length; i++) {
            const r = rooms[i];
            const lastchat = await Chat.findOne({ idRoom: r._id })
                .sort({ createdAt: -1 })
                .populate("idPengirim", "nama email")
                .populate({
                    path: "idChatReply",
                    select: "pesan idPengirim",
                    populate: { path: "idPengirim", select: "nama" },
                })
                .populate("seenUsers.user", "nama email");
            const chatsUnread = await Chat.find({
                idRoom: r._id,
                "seenUsers.user": { $ne: req.user.id },
            });
            roomsFix.push({
                ...r._doc,
                lastchat,
                chatsUnread: chatsUnread.length,
            });
        }
        res.status(200).json(
            roomsFix.map((r) => {
                return {
                    ...r,
                    nama:
                        r.tipe == "private"
                            ? r.anggota.filter((a) => a._id != req.user.id)[0]
                                  .nama
                            : r.nama,
                    online:
                        r.tipe == "private"
                            ? r.anggota.filter((a) => a._id != req.user.id)[0]
                                  .online.status
                            : false,
                };
            })
        );
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const addRoom = async (req, res) => {
    // anggota = array email teman-teman yang di invite
    try {
        const { nama, anggota, tipe } = req.body;
        if (anggota.length == 0) {
            return res.status(404).json({ pesan: "Pilih temanmu minimal 1" });
        }
        const checkAvailableAnggota = await User.find({
            email: { $in: anggota },
        });
        if (checkAvailableAnggota.length != anggota.length) {
            return res
                .status(404)
                .json({ pesan: "Ada email anggota yang tidak ditemukan" });
        }
        if (tipe == "private") {
            if (anggota.length > 1) {
                return res.status(400).json({
                    pesan: "Tipe private hanya bisa invite 1 anggota",
                });
            }
            const checkRoom = await Room.find({
                anggota: { $all: [req.user.id, ...checkAvailableAnggota] },
                tipe: "private",
            });
            if (checkRoom.length > 0) {
                return res
                    .status(400)
                    .json({ pesan: "Anda sudah memiliki room private" });
            }
        }
        const idAnggota = checkAvailableAnggota.map((item) => {
            return item._id;
        });
        const room = await Room.create({
            nama: tipe == "private" ? null : nama,
            anggota: [req.user.id, ...idAnggota],
            tipe,
        });
        let roomNew = await Room.findById(room._id).populate(
            "anggota",
            "nama email online"
        );

        const ws = new WebSocket(`${process.env.URL_WS}`);
        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    tipe: "room",
                    data: {
                        ...roomNew._doc,
                        users_id: [req.user.id, ...idAnggota],
                        action: "add",
                        chatsUnread: 0,
                        lastchat: null,
                        nama:
                            roomNew.tipe == "private"
                                ? roomNew.anggota.filter(
                                      (a) => a._id != req.user.id
                                  )[0].nama
                                : roomNew.nama,
                        online:
                            roomNew.tipe == "private"
                                ? roomNew.anggota.filter(
                                      (a) => a._id != req.user.id
                                  )[0].online.status
                                : false,
                    },
                }),
                (err) => {
                    res.status(200).json(room);
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
const joinRoom = async (req, res) => {
    try {
        let room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ pesan: "Id room tidak ditemukan" });
        }
        if (room.tipe == "private") {
            return res
                .status(400)
                .json({ pesan: "Room private tidak bisa di join" });
        }
        if (room.anggota.includes(req.user.id)) {
            return res.status(404).json({ pesan: "Anda sudah join room" });
        }
        const databaru = await Room.findByIdAndUpdate(req.params.id, {
            $push: { anggota: req.user.id },
        });
        res.status(200).json(databaru);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const exitRoom = async (req, res) => {
    try {
        let room = await Room.findById(req.params.id).populate(
            "anggota",
            "nama email"
        );
        if (!room) {
            return res.status(404).json({ pesan: "Id room tidak ditemukan" });
        }
        await Room.findByIdAndUpdate(req.params.id, {
            $pull: { anggota: req.user.id },
        });

        if (room.tipe == "private") {
            room = {
                ...room._doc,
                nama: room.anggota.filter((a) => a._id != req.user.id)[0].nama,
            };
        }

        if (room.anggota.filter((a) => a._id != req.user.id).length <= 1) {
            await Room.findByIdAndDelete(req.params.id);
            await Chat.deleteMany({ idRoom: req.params.id });

            const ws = new WebSocket(`${process.env.URL_WS}`);
            ws.onopen = () => {
                ws.send(
                    JSON.stringify({
                        tipe: "room",
                        data: {
                            ...room._doc,
                            _id: req.params.id,
                            users_id: room.anggota.map((a) => a._id),
                            action: "delete",
                        },
                    }),
                    (err) => {
                        res.status(200).json({
                            pesan: `Anda telah keluar dari room ${room.nama}`,
                        });
                        ws.close();
                    }
                );
            };
            ws.onerror = (err) => {
                res.status(400).json({
                    pesan: "WebSocket error: " + err.message,
                });
            };
        } else {
            res.status(200).json({
                pesan: `Anda telah keluar dari room ${room.nama}`,
            });
        }
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const updateRoom = async (req, res) => {
    try {
        let { nama } = req.body;
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ pesan: "Room tidak ditemukan" });
        }
        if (room.anggota.filter((a) => a._id == req.user.id).length == 0) {
            return res
                .status(404)
                .json({ pesan: "Anda tidak memiliki akses edit room ini" });
        }
        if (room.tipe == "private") {
            return res
                .status(404)
                .json({ pesan: "Room private tidak dapat diedit" });
        }
        await Room.findByIdAndUpdate(req.params.id, { nama });
        res.status(200).json({
            ...room._doc,
            nama,
        });
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

module.exports = {
    // getRooms,
    getRoom,
    addRoom,
    joinRoom,
    exitRoom,
    updateRoom,
};

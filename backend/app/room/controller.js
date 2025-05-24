const Room = require("./model.js");
const User = require("../user/model.js");
const Chat = require("../chat/model.js");

const getRoom = async (req, res) => {
    try {
        const { id } = req.params;
        if (id) {
            let room = await Room.findById(id)
                .populate("anggota", "nama email")
                .populate({
                    path: "chats",
                    populate: { path: "idPengirim", select: "nama email" },
                });
            if (!room) {
                return res
                    .status(404)
                    .json({ pesan: "Id room tidak ditemukan" });
            }
            if (room.anggota.filter((a) => a._id == req.user.id).length == 0) {
                return res
                    .status(404)
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
        const rooms = await Room.find({
            anggota: { $all: [req.user.id] },
        })
            .populate("anggota", "nama email")
            .populate({
                path: "lastchat",
                populate: { path: "idPengirim", select: "nama email" },
            });
        res.status(200).json(
            rooms.map((r) => {
                return {
                    ...r._doc,
                    nama:
                        r._doc.tipe == "private"
                            ? r._doc.anggota.filter(
                                  (a) => a._id != req.user.id
                              )[0].nama
                            : r._doc.nama,
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
            tipe: tipe,
        });
        res.status(200).json(room);
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
        }
        res.status(200).json({
            pesan: `Anda telah keluar dari room ${room.nama}`,
        });
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

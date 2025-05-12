const Room = require("../models/room.model.js");
const User = require("../models/user.model.js");

const getRooms = async (req, res) => {
    try {
        // console.log(req.user);
        const rooms = await Room.find({ anggota: { $all: [req.user.id] } });
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const getRoom = async (req, res) => {
    try {
        let room = await Room.findById(req.params.id);
        let detailAnggota = [];
        for (const anggota of room.anggota) {
            const usernya = await User.findById(anggota);
            if (usernya) detailAnggota.push(usernya);
        }
        const room1 = { ...room._doc, detailAnggota: detailAnggota };
        res.status(200).json(room1);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const addRoom = async (req, res) => {
    try {
        const data = {
            nama: req.body.nama,
            anggota: [req.user.id],
        };
        const room = await Room.create(data);
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const joinRoom = async (req, res) => {
    try {
        // console.log(req.params.id);
        let room = await Room.findById(req.params.id);
        console.log(room);
        if (!room) {
            return res.status(404).json({ pesan: "Id room tidak ditemukan" });
        }
        let anggotaBaru = room.anggota;
        if (anggotaBaru.includes(req.user.id)) {
            return res.status(404).json({ pesan: "Anda sudah masuk room" });
        }
        anggotaBaru.push(req.user.id);
        room.anggota = anggotaBaru;
        await Room.findByIdAndUpdate(req.params.id, { anggota: anggotaBaru });
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const exitRoom = async (req, res) => {
    try {
        // console.log(req.params.id);
        let room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ pesan: "Id room tidak ditemukan" });
        }
        let anggotaBaru = room.anggota;
        const indexId = anggotaBaru.indexOf(req.user.id);
        if (indexId > -1) {
            anggotaBaru.splice(indexId, 1);
        } else {
            return res.status(404).json({ pesan: "Anda sudah keluar room" });
        }
        room.anggota = anggotaBaru;
        await Room.findByIdAndUpdate(req.params.id, { anggota: anggotaBaru });
        if (room.anggota.length == 0) {
            await Room.findByIdAndDelete(req.params.id);
            return res
                .status(200)
                .json({ pesan: "Room telah dihapus otomatis" });
        }
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const updateRoom = async (req, res) => {
    try {
        let data = req.body;
        const room = await Room.findByIdAndUpdate(req.params.id, data);
        if (!room) {
            res.status(404).json({ pesan: "Room tidak ditemukan" });
        }
        const updatedRoom = await Room.findById(req.params.id);
        res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

module.exports = {
    getRooms,
    getRoom,
    addRoom,
    joinRoom,
    exitRoom,
    updateRoom,
};

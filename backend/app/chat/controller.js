const Chat = require("./model.js");
const Room = require("../room/model.js");

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
                .status(404)
                .json({ pesan: "Anda tidak memiliki akses ke room ini" });
        }
        const data = {
            idRoom: req.params.id,
            pesan: req.body.pesan,
            idPengirim: req.user.id,
        };
        const chat = new Chat(data);
        await chat.save();
        res.status(200).json(chat);
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
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

module.exports = {
    addChat,
    delChat,
};

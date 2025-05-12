const Chat = require("../models/chat.model.js");
const Room = require("../models/room.model.js");
const User = require("../models/user.model.js");

const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({ idRoom: req.params.id });
        let chatsBaru = [];
        for (const chat of chats) {
            const usernya = await User.findById(chat.idPengirim);
            if (usernya) chatsBaru.push({ ...chat._doc, user: usernya });
            else
                chatsBaru.push({
                    ...usernya._doc,
                    user: {
                        nama: false,
                        _id: false,
                    },
                });
        }
        res.status(200).json(chatsBaru);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

const addChat = async (req, res) => {
    try {
        const data = {
            idRoom: req.params.id,
            pesan: req.body.pesan,
            idPengirim: req.user.id,
        };
        const responya = await Chat.create(data);
        console.log(responya);
        const dataRoom = {
            lastchat: {
                pesan: req.body.pesan,
                idPengirim: req.user.id,
                waktu: responya.createdAt,
            },
            // nama: req.body.pesan,
        };
        await Room.findByIdAndUpdate(req.params.id, dataRoom);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const delChat = async (req, res) => {
    try {
        // const data = {
        //     idRoom: ,
        //     pesan: req.body.pesan,
        //     idPengirim: req.user.id,
        // };
        await Chat.findByIdAndDelete(req.params.id);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

module.exports = {
    getChats,
    addChat,
    delChat,
};

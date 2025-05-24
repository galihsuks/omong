const mongoose = require("mongoose");

const RoomSchema = mongoose.Schema(
    {
        nama: {
            type: String,
            default: null,
        },
        tipe: {
            type: String,
            enum: ["group", "private"],
        },
        anggota: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        chats: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Chat",
            },
        ],
        lastchat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Room = mongoose.model("Room", RoomSchema);
module.exports = Room;

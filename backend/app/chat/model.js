const mongoose = require("mongoose");
const Room = require("../room/model");

const ChatSchema = mongoose.Schema(
    {
        pesan: {
            type: String,
            required: true,
        },
        idPengirim: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        idRoom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

ChatSchema.post("save", async function (doc) {
    if (!doc) return;
    try {
        await Room.findByIdAndUpdate(doc.idRoom, {
            $push: { chats: doc._id },
            lastchat: doc._id,
        });
    } catch (error) {
        console.error("Error updating room", error);
    }
});

ChatSchema.post("findOneAndDelete", async function (doc) {
    if (!doc) return;
    try {
        const room = await Room.findById(doc.idRoom);
        await Room.findByIdAndUpdate(doc.idRoom, {
            $pull: { chats: doc._id },
            lastchat:
                room.chats.length == 1
                    ? null
                    : room.lastchat.equals(doc._id)
                    ? room.chats[room.chats.length - 2]
                    : room.lastchat,
        });
    } catch (error) {
        console.error("Error updating room after chat deletion", error);
    }
});

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;

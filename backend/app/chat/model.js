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
        idChatReply: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            default: null,
        },
        seenUsers: [
            {
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
            },
        ],
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

const Chat = mongoose.model("Chat", ChatSchema);

ChatSchema.post("findOneAndDelete", async function (doc) {
    if (!doc) return;
    try {
        const room = await Room.findById(doc.idRoom);
        await Room.findByIdAndUpdate(doc.idRoom, {
            $pull: { chats: doc._id },
        });
    } catch (error) {
        console.error("Error updating room after chat deletion", error);
    }
});

module.exports = Chat;

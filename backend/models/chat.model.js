const mongoose = require("mongoose");

const ChatSchema = mongoose.Schema(
    {
        idRoom: {
            type: String,
            required: true,
        },
        pesan: {
            type: String,
            required: true,
        },
        idPengirim: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;

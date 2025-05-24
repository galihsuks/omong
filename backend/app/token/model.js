const mongoose = require("mongoose");

const TokenSchema = mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
        },
        ip: {
            type: String,
            required: true,
        },
        browser: {
            type: String,
            required: true,
        },
        os: {
            type: String,
            required: true,
        },
        platform: {
            type: String,
            required: true,
        },
        idUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        // lokasi: {
        //     type: String,
        //     required: true,
        // },
    },
    {
        timestamps: true,
    }
);

const Token = mongoose.model("Token", TokenSchema);
module.exports = Token;

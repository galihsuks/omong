const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Isi email Anda"],
            unique: true,
        },
        sandi: {
            type: String,
            required: [true, "Isi sandi Anda"],
        },
        nama: {
            type: String,
            required: [true, "Isi nama Anda"],
        },
        online: {
            status: {
                type: Boolean,
                default: false,
            },
            last: {
                type: Date,
                default: null,
            },
        },
        token: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Token",
            },
        ],
    },
    {
        timestamps: true,
    },
);

const User = mongoose.model("User", UserSchema);
module.exports = User;

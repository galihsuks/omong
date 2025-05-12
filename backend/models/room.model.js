const mongoose = require("mongoose");

const RoomSchema = mongoose.Schema(
    {
        nama: {
            type: String,
            required: true,
            default: "Belum diisi",
        },
        anggota: {
            type: Array,
            required: true,
            default: [],
        },
        lastchat: {
            pesan: {
                type: String,
                required: false,
                default: "",
            },
            idPengirim: {
                type: String,
                required: false,
                default: "",
            },
            waktu: {
                type: Date,
                required: false,
            },
        },
    },
    {
        timestamps: true,
    }
);

const Room = mongoose.model("Room", RoomSchema);
module.exports = Room;

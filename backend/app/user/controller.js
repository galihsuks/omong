const User = require("./model.js");
const Room = require("../room/model.js");
const bcrypt = require("bcrypt");
const Token = require("../token/model.js");

const getUserCur = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user)
            return res.status(404).json({ pesan: "User tidak ditemukan" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ pesan: "User tidak ditemukan" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const getBy = async (req, res) => {
    try {
        const filter = req.params.filter;
        const { limit = 5 } = req.query;
        const filterAllowed = ["nama", "email"];
        if (!filterAllowed.includes(filter)) {
            return res.status(400).json({ pesan: "Filter tidak valid" });
        }
        const query = {};
        query[filter] = { $regex: req.body.value, $options: "i" };
        if (req.user && req.user[filter]) {
            query[filter]["$ne"] = req.user[filter];
        }
        const users = await User.find(query).limit(Number(limit));
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const updateUser = async (req, res) => {
    try {
        let { nama, email } = req.body;
        let data = {};
        if (req.body.sandi) {
            const hashedPassword = await new Promise((resolve, reject) => {
                bcrypt.hash(req.body.sandi, 10, async (err, hash) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ pesan: "Error hashing passwords" });
                    }
                    resolve(hash);
                });
            });
            data.sandi = hashedPassword;
        }
        if (req.body.nama) {
            data.nama = nama;
        }
        if (req.body.email) {
            const emailExists = await User.findOne({ email: email });
            if (emailExists && emailExists._id.toString() !== req.user.id) {
                return res.status(400).json({ pesan: "Email sudah digunakan" });
            }
            data.email = email;
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ pesan: "User tidak ditemukan" });
        }
        await User.findByIdAndUpdate(req.user.id, data);
        delete data.sandi;
        res.status(200).json({ ...user._doc, ...data });
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({
            email: req.user.email,
        });
        if (!user) {
            res.status(404).json({ pesan: "User tidak ditemukan" });
        }
        await Token.deleteMany({
            idUser: user._id,
        });
        await Room.updateMany(
            { $in: { anggota: user._id } },
            { $pull: { anggota: user._id } },
        );
        res.status(200).json({ pesan: "User berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

const online = async (req, res) => {
    try {
        const { status } = req.body; //status : boolean;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { online: { status, last: Date.now() } },
            { new: true },
        );
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

module.exports = {
    updateUser,
    deleteUser,
    getUserCur,
    getUserById,
    getBy,
    online,
};

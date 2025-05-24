const User = require("./model.js");
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
const updateUser = async (req, res) => {
    try {
        let data = req.body;
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
        console.log({
            data: data,
        });
        const user = await User.findByIdAndUpdate(req.user.id, data);
        if (!user) {
            res.status(404).json({ pesan: "User tidak ditemukan" });
        }
        const updatedUser = await User.findById(req.user.id);
        res.status(200).json(updatedUser);
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
        res.status(200).json({ pesan: "User berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

module.exports = {
    updateUser,
    deleteUser,
    getUserCur,
    getUserById,
};

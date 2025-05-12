const Room = require("../models/room.model.js");
const User = require("../models/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUser = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(404).json({ pesan: "Email tidak ditemukan" });
        bcrypt.compare(req.body.sandi, user.sandi, (err, result) => {
            if (err) {
                return res
                    .status(500)
                    .json({ pesan: "Error comparing passwords" });
            }
            // return res.status(200).json(user);
            const payload = {
                id: user._id,
                email: user.email,
                nama: user.nama,
            };
            if (result) {
                const accessToken = jwt.sign(
                    payload,
                    process.env.ACCESS_TOKEN_SECRET
                );
                res.status(200).json({ token: accessToken });
            } else {
                res.status(401).json({ pesan: "Sandi salah" });
            }
        });
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};
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
const addUser = (req, res) => {
    try {
        bcrypt.hash(req.body.sandi, 10, async (err, hash) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ pesan: "Error hashing passwords" });
            }
            const data = {
                email: req.body.email,
                nama: req.body.nama,
                sandi: hash,
            };
            try {
                const user = await User.create(data);
                res.status(200).json(user);
            } catch (error) {
                if (error.errorResponse.code == 11000) {
                    return res
                        .status(401)
                        .json({ pesan: "Email telah digunakan" });
                }
                res.status(500).json({ pesan: error.message });
            }
        });
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
        const user = await User.findByIdAndDelete(req.user.id);
        if (!user) {
            res.status(404).json({ pesan: "User tidak ditemukan" });
        }
        res.status(200).json({ pesan: "User berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

module.exports = {
    getUser,
    addUser,
    updateUser,
    deleteUser,
    getUserCur,
    getUserById,
};

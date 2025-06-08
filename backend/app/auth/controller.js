require("dotenv").config();
const User = require("../user/model");
const Token = require("../token/model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = (req, res) => {
    try {
        bcrypt.hash(req.body.sandi, 10, async (err, hash) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ pesan: "Error hashing passwords" });
            }
            try {
                await User.create({
                    ...req.body,
                    sandi: hash,
                });
                res.status(200).json({
                    pesan: "Kamu berhasil mendaftar, silahkan login!",
                });
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

const login = async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email,
        });
        if (!user)
            return res.status(404).json({ pesan: "User tidak ditemukan" });
        bcrypt.compare(req.body.sandi, user.sandi, async (err, result) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ pesan: "Error comparing passwords" });
            }
            if (result) {
                const accessToken = jwt.sign(
                    { email: user.email, nama: user.nama, id: user._id },
                    process.env.ACCESS_TOKEN_SECRET
                );
                const ua = req.useragent;
                const token = await Token.create({
                    content: accessToken,
                    ip:
                        req.headers["x-forwarded-for"] ||
                        req.connection.remoteAddress,
                    browser: ua.browser,
                    os: ua.os,
                    platform: ua.platform,
                    idUser: user._id,
                });
                await User.findByIdAndUpdate(user._id, {
                    $push: { token: token._id },
                });
                res.status(200).json({
                    email: user.email,
                    nama: user.nama,
                    id: user._id,
                    token: accessToken,
                });
            } else {
                res.status(401).json({ pesan: "Sandi salah" });
            }
        });
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

const logout = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user)
            return res.status(401).json({ pesan: "User tidak ditemukan" });
        const token = await Token.findOne({ content: req.user.token });
        if (!token)
            return res.status(401).json({ pesan: "Token tidak ditemukan" });
        await User.findOneAndUpdate(
            { email: req.user.email },
            {
                $pull: { token: token._id },
                $set: {
                    "online.status": false,
                    "online.last": Date.now(),
                },
            }
        );
        await Token.findByIdAndDelete(token._id);
        res.status(200).json({ pesan: "Berhasil logout" });
    } catch (error) {
        res.status(500).json({ pesan: error.message });
    }
};

module.exports = {
    signup,
    login,
    logout,
};

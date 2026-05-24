import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { Token } from "../models/token.model";
import { env } from "../config/env";
import { AuthRequest } from "../types/auth";

export async function signup(req: Request, res: Response) {
  try {
    const hash = await bcrypt.hash(req.body.sandi, 10);
    await User.create({ ...req.body, sandi: hash, timezone: req.body.timezone || "Asia/Jakarta" });
    return res.status(200).json({ message: "Sign up successful. Please log in.", data: null });
  } catch (error: any) {
    if (error?.code === 11000)
      return res.status(401).json({ message: "Email is already in use.", data: null });
    return res.status(500).json({ message: error.message, data: null });
  }
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found.", data: null });
    const match = await bcrypt.compare(req.body.sandi, user.sandi);
    if (!match) return res.status(401).json({ message: "Incorrect password.", data: null });

    const accessToken = jwt.sign(
      { email: user.email, nama: user.nama, id: user._id },
      env.ACCESS_TOKEN_SECRET,
    );
    const ua = (req as any).useragent;
    const token = await Token.create({
      content: accessToken,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
      browser: ua?.browser ?? "unknown",
      os: ua?.os ?? "unknown",
      platform: ua?.platform ?? "unknown",
      idUser: user._id,
    });
    await User.findByIdAndUpdate(user._id, { $push: { token: token._id } });

    return res.status(200).json({
      message: "Success login",
      data: {
        email: user.email,
        nama: user.nama,
        id: user._id,
        timezone: user.timezone,
        token: accessToken,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

export async function loginByParam(req: AuthRequest, res: Response) {
  try {
    const encoded = String(req.params.param ?? "");
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const [timestampRaw, userId] = decoded.split(";");
    const timestamp = Number(timestampRaw);
    if (!userId || Number.isNaN(timestamp)) {
      return res.status(400).json({ message: "Invalid login parameter.", data: null });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found.", data: null });

    const accessToken = jwt.sign(
      { email: user.email, nama: user.nama, id: user._id },
      env.ACCESS_TOKEN_SECRET,
    );
    const ua = (req as any).useragent;
    const token = await Token.create({
      content: accessToken,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown",
      browser: ua?.browser ?? "unknown",
      os: ua?.os ?? "unknown",
      platform: ua?.platform ?? "unknown",
      idUser: user._id,
    });
    await User.findByIdAndUpdate(user._id, { $push: { token: token._id } });

    return res.status(200).json({
      message: "Success login",
      data: { email: user.email, nama: user.nama, id: user._id, token: accessToken },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

export async function logout(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized", data: null });
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(401).json({ message: "User not found.", data: null });
    const token = await Token.findOne({ content: req.user.token });
    if (!token) return res.status(401).json({ message: "Token not found.", data: null });

    await User.findOneAndUpdate(
      { email: req.user.email },
      { $pull: { token: token._id }, $set: { "online.status": false, "online.last": Date.now() } },
    );
    await Token.findByIdAndDelete(token._id);
    return res.status(200).json({ message: "Logged out successfully.", data: null });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

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
    await User.create({ ...req.body, sandi: hash, timezone: req.body.timezone || "UTC" });
    return res.status(200).json({ pesan: "Sign up successful. Please log in." });
  } catch (error: any) {
    if (error?.code === 11000) return res.status(401).json({ pesan: "Email is already in use." });
    return res.status(500).json({ pesan: error.message });
  }
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ pesan: "User not found." });
    const match = await bcrypt.compare(req.body.sandi, user.sandi);
    if (!match) return res.status(401).json({ pesan: "Incorrect password." });

    const accessToken = jwt.sign({ email: user.email, nama: user.nama, id: user._id }, env.ACCESS_TOKEN_SECRET);
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

    return res.status(200).json({ email: user.email, nama: user.nama, id: user._id, token: accessToken });
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

export async function logout(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ pesan: "Unauthorized" });
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(401).json({ pesan: "User not found." });
    const token = await Token.findOne({ content: req.user.token });
    if (!token) return res.status(401).json({ pesan: "Token not found." });

    await User.findOneAndUpdate(
      { email: req.user.email },
      { $pull: { token: token._id }, $set: { "online.status": false, "online.last": Date.now() } },
    );
    await Token.findByIdAndDelete(token._id);
    return res.status(200).json({ pesan: "Logged out successfully." });
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

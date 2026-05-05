import { Response } from "express";
import bcrypt from "bcrypt";
import { AuthRequest } from "../types/auth";
import { User } from "../models/user.model";
import { Room } from "../models/room.model";
import { Token } from "../models/token.model";

export async function getUserCur(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user?.id);
  if (!user) return res.status(404).json({ pesan: "User tidak ditemukan" });
  return res.status(200).json(user);
}

export async function getBy(req: AuthRequest, res: Response) {
  try {
    const filter = req.params.filter as "nama" | "email";
    if (!["nama", "email"].includes(filter)) return res.status(400).json({ pesan: "Filter tidak valid" });
    const query: Record<string, unknown> = {};
    query[filter] = { $regex: req.body.value, $options: "i", $ne: req.user?.[filter] };
    const users = await User.find(query).limit(Number(req.query.limit ?? 5));
    return res.status(200).json(users);
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ pesan: "Unauthorized" });
    const data: Record<string, string> = {};
    if (req.body.sandi) data.sandi = await bcrypt.hash(req.body.sandi, 10);
    if (req.body.nama) data.nama = req.body.nama;
    if (req.body.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists && String(emailExists._id) !== req.user.id) {
        return res.status(400).json({ pesan: "Email sudah digunakan" });
      }
      data.email = req.body.email;
    }
    const user = await User.findByIdAndUpdate(req.user.id, data, { new: true });
    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ pesan: "Unauthorized" });
    const user = await User.findOneAndDelete({ email: req.user.email });
    if (!user) return res.status(404).json({ pesan: "User tidak ditemukan" });
    await Token.deleteMany({ idUser: user._id });
    await Room.updateMany({ anggota: user._id }, { $pull: { anggota: user._id } });
    return res.status(200).json({ pesan: "User berhasil dihapus" });
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

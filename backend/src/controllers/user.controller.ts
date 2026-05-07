import { Response } from "express";
import bcrypt from "bcrypt";
import { AuthRequest } from "../types/auth";
import { User } from "../models/user.model";
import { Room } from "../models/room.model";
import { Token } from "../models/token.model";

function toUserProfileDto(user: any) {
  if (!user) return null;
  return {
    _id: String(user._id),
    nama: user.nama,
    email: user.email,
    timezone: user.timezone ?? "UTC",
    online: user.online,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getUserCur(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user?.id).select(
    "_id nama email timezone online createdAt updatedAt",
  );
  if (!user) return res.status(404).json({ pesan: "User not found." });
  return res.status(200).json(toUserProfileDto(user));
}

export async function getBy(req: AuthRequest, res: Response) {
  try {
    const filter = req.params.filter as "nama" | "email";
    if (!["nama", "email"].includes(filter)) return res.status(400).json({ pesan: "Invalid filter." });
    const query: Record<string, unknown> = {};
    query[filter] = { $regex: req.body.value, $options: "i", $ne: req.user?.[filter] };
    const users = await User.find(query).limit(Number(req.query.limit ?? 5));
    return res.status(200).json(users);
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

export async function searchRoomMemberCandidates(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ pesan: "Unauthorized" });

    const roomId = String(req.params.roomId ?? "").trim();
    const keyword = String(req.body.value ?? "").trim();

    if (!roomId) return res.status(400).json({ pesan: "Room ID is required." });
    if (keyword.length < 2) return res.status(200).json([]);

    const room = await Room.findById(roomId).select("anggota");
    if (!room) return res.status(404).json({ pesan: "Room ID not found." });

    const hasAccess = (room.anggota as any[]).some((anggota) => String(anggota) === req.user?.id);
    if (!hasAccess) {
      return res.status(403).json({ pesan: "You do not have access to this room." });
    }

    const users = await User.find({
      email: { $regex: keyword, $options: "i" },
      _id: { $nin: room.anggota },
    })
      .select("_id nama email")
      .limit(Number(req.query.limit ?? 10));

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
        return res.status(400).json({ pesan: "Email is already in use." });
      }
      data.email = req.body.email;
    }
    if (req.body.timezone) {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: req.body.timezone });
      } catch {
        return res.status(400).json({ pesan: "Invalid timezone." });
      }
      data.timezone = req.body.timezone;
    }
    const user = await User.findByIdAndUpdate(req.user.id, data, { new: true }).select(
      "_id nama email timezone online createdAt updatedAt",
    );
    return res.status(200).json(toUserProfileDto(user));
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ pesan: "Unauthorized" });
    const user = await User.findOneAndDelete({ email: req.user.email });
    if (!user) return res.status(404).json({ pesan: "User not found." });
    await Token.deleteMany({ idUser: user._id });
    await Room.updateMany({ anggota: user._id }, { $pull: { anggota: user._id } });
    return res.status(200).json({ pesan: "User deleted successfully." });
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

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
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getUserCur(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user?.id).select(
    "_id nama email timezone createdAt updatedAt",
  );
  if (!user) return res.status(404).json({ message: "User not found.", data: null });
  return res.status(200).json({ message: "Success get user", data: toUserProfileDto(user) });
}

export async function searchUsers(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized", data: null });
    const keywords = String(req.query.keywords ?? "").trim();
    const roomExceptId = String(req.query.room_except_id ?? "").trim();
    if (keywords.length < 2) {
      return res.status(200).json({ message: "Success get members", data: [] });
    }

    const query: Record<string, unknown> = {
      $or: [
        { nama: { $regex: keywords, $options: "i" } },
        { email: { $regex: keywords, $options: "i" } },
      ],
      _id: { $ne: req.user.id },
    };

    if (roomExceptId) {
      const room = await Room.findById(roomExceptId).select("anggota");
      if (room) query._id = { $nin: [...room.anggota, req.user.id] };
    }

    const users = await User.find(query)
      .select("_id nama email")
      .limit(Number(req.query.limit ?? 20));
    return res.status(200).json({ message: "Success get members", data: users });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

export async function getUserOne(req: AuthRequest, res: Response) {
  try {
    const nama = String(req.body?.nama ?? "").trim();
    const email = String(req.body?.email ?? "").trim();
    if (!nama && !email) {
      return res.status(400).json({ message: "nama or email is required.", data: null });
    }

    const query: Record<string, unknown>[] = [];
    if (nama) query.push({ nama: { $regex: `^${nama}$`, $options: "i" } });
    if (email) query.push({ email: { $regex: `^${email}$`, $options: "i" } });

    const user = await User.findOne({ $or: query }).select(
      "_id nama email online createdAt updatedAt",
    );
    if (!user) return res.status(404).json({ message: "User not found.", data: null });

    return res.status(200).json({
      message: "Success get user",
      data: {
        _id: String(user._id),
        nama: user.nama,
        email: user.email,
        online: user.online ?? { status: false, last: null },
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized", data: null });
    const data: Record<string, string> = {};
    if (req.body.sandi) data.sandi = await bcrypt.hash(req.body.sandi, 10);
    if (req.body.nama) data.nama = req.body.nama;
    if (req.body.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists && String(emailExists._id) !== req.user.id) {
        return res.status(400).json({ message: "Email is already in use.", data: null });
      }
      data.email = req.body.email;
    }
    if (req.body.timezone) {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: req.body.timezone });
      } catch {
        return res.status(400).json({ message: "Invalid timezone.", data: null });
      }
      data.timezone = req.body.timezone;
    }
    const user = await User.findByIdAndUpdate(req.user.id, data, { new: true }).select(
      "_id nama email timezone createdAt updatedAt",
    );
    return res.status(200).json({ message: "Success update user", data: toUserProfileDto(user) });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

export async function getOnlineUsers(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized", data: null });
    const userIds = Array.isArray(req.body?.user_ids) ? (req.body.user_ids as string[]) : [];
    if (!userIds.length) return res.status(200).json({ message: "Success get users", data: [] });

    const users = await User.find({ _id: { $in: userIds } }).select("_id online");
    const data = users.map((user: any) => ({
      _id: String(user._id),
      isOnline: Boolean(user.online?.status),
      lastSeen: user.online?.last ? new Date(user.online.last).toISOString() : null,
    }));

    return res.status(200).json({ message: "Success get users", data });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized", data: null });
    const user = await User.findOneAndDelete({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found.", data: null });
    await Token.deleteMany({ idUser: user._id });
    await Room.updateMany({ anggota: user._id }, { $pull: { anggota: user._id } });
    return res.status(200).json({ message: "User deleted successfully.", data: null });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

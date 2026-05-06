import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { Room } from "../models/room.model";
import { Chat } from "../models/chat.model";
import { User } from "../models/user.model";

export async function getRoom(req: AuthRequest, res: Response) {
  try {
    const roomId = req.params.id;
    if (!req.user) return res.status(401).json({ pesan: "Unauthorized" });

    if (roomId) {
      const room = await Room.findById(roomId)
        .populate("anggota", "nama email online")
        .populate({
          path: "chats",
          populate: [
            { path: "idPengirim", select: "nama email" },
            {
              path: "idChatReply",
              select: "pesan idPengirim",
              populate: { path: "idPengirim", select: "nama" },
            },
            { path: "seenUsers.user", select: "nama email" },
          ],
        });

      if (!room) return res.status(404).json({ pesan: "Id room tidak ditemukan" });

      const hasAccess = (room.anggota as any[]).some((a) => String(a._id) === req.user?.id);
      if (!hasAccess) {
        return res.status(400).json({ pesan: "Anda tidak memiliki akses ke room ini" });
      }

      return res.status(200).json(room);
    }

    const keywords = String(req.query.keywords ?? "").trim().toLowerCase();

    const rooms = await Room.find({ anggota: { $all: [req.user.id] } })
      .sort({ updatedAt: -1 })
      .populate("anggota", "nama email online");

    const mapped = await Promise.all(
      rooms.map(async (r: any) => {
        const lastchat = await Chat.findOne({ idRoom: r._id })
          .sort({ createdAt: -1 })
          .populate("idPengirim", "nama email")
          .populate({
            path: "idChatReply",
            select: "pesan idPengirim",
            populate: { path: "idPengirim", select: "nama" },
          })
          .populate("seenUsers.user", "nama email");

        const chatsUnread = await Chat.countDocuments({
          idRoom: r._id,
          "seenUsers.user": { $ne: req.user?.id },
        });

        const teman =
          r.tipe === "private"
            ? (r.anggota as any[]).find((a) => String(a._id) !== req.user?.id)
            : null;

        const nama = r.tipe === "private" ? teman?.nama : r.nama;
        const roomDto = {
          ...r.toObject(),
          lastchat,
          chatsUnread,
          nama,
          online: r.tipe === "private" ? teman?.online?.status : false,
        };

        return roomDto;
      }),
    );

    const filtered = keywords
      ? mapped.filter((room) =>
          String(room.nama ?? "").toLowerCase().includes(keywords),
        )
      : mapped;

    return res.status(200).json(filtered);
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

export async function addRoom(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ pesan: "Unauthorized" });

    const { nama, anggota, tipe } = req.body;
    if (!Array.isArray(anggota) || anggota.length === 0) {
      return res.status(404).json({ pesan: "Pilih temanmu minimal 1" });
    }

    const users = await User.find({ email: { $in: anggota } });
    if (users.length !== anggota.length) {
      return res.status(404).json({ pesan: "Ada email anggota yang tidak ditemukan" });
    }

    if (tipe === "private" && users.length > 1) {
      return res.status(400).json({ pesan: "Tipe private hanya bisa invite 1 anggota" });
    }

    const room = await Room.create({
      nama: tipe === "private" ? null : nama,
      anggota: [req.user.id, ...users.map((u) => u._id)],
      tipe,
    });

    return res.status(200).json(room);
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

export async function joinRoom(req: AuthRequest, res: Response) {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ pesan: "Id room tidak ditemukan" });
  if (room.tipe === "private") {
    return res.status(400).json({ pesan: "Room private tidak bisa di join" });
  }
  if ((room.anggota as any[]).some((a) => String(a) === req.user?.id)) {
    return res.status(404).json({ pesan: "Anda sudah join room" });
  }

  const data = await Room.findByIdAndUpdate(
    req.params.id,
    { $push: { anggota: req.user?.id } },
    { new: true },
  );

  return res.status(200).json(data);
}

export async function exitRoom(req: AuthRequest, res: Response) {
  const room = await Room.findById(req.params.id).populate("anggota", "nama email");
  if (!room) return res.status(404).json({ pesan: "Id room tidak ditemukan" });

  await Room.findByIdAndUpdate(req.params.id, { $pull: { anggota: req.user?.id } });

  return res.status(200).json({ pesan: "Anda telah keluar dari room" });
}

export async function updateRoom(req: AuthRequest, res: Response) {
  try {
    const { nama } = req.body as { nama?: string };
    const room = await Room.findById(req.params.id);

    if (!room) return res.status(404).json({ pesan: "Room tidak ditemukan" });

    const hasAccess = (room.anggota as any[]).some((a) => String(a) === req.user?.id);
    if (!hasAccess) {
      return res.status(403).json({ pesan: "Anda tidak memiliki akses edit room ini" });
    }

    if (room.tipe === "private") {
      return res.status(400).json({ pesan: "Room private tidak dapat diedit" });
    }

    await Room.findByIdAndUpdate(req.params.id, { nama });
    return res.status(200).json({ ...room.toObject(), nama });
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

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

      if (!room) return res.status(404).json({ pesan: "Room ID not found." });

      const hasAccess = (room.anggota as any[]).some((a) => String(a._id) === req.user?.id);
      if (!hasAccess) {
        return res.status(400).json({ pesan: "You do not have access to this room." });
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
      return res.status(404).json({ pesan: "Please select at least one member." });
    }

    const users = await User.find({ email: { $in: anggota } });
    if (users.length !== anggota.length) {
      return res.status(404).json({ pesan: "Some member emails were not found." });
    }

    if (tipe === "private" && users.length > 1) {
      return res.status(400).json({ pesan: "Private rooms can only invite one member." });
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
  if (!room) return res.status(404).json({ pesan: "Room ID not found." });
  if (room.tipe === "private") {
    return res.status(400).json({ pesan: "Private rooms cannot be joined." });
  }
  if ((room.anggota as any[]).some((a) => String(a) === req.user?.id)) {
    return res.status(404).json({ pesan: "You have already joined this room." });
  }

  const data = await Room.findByIdAndUpdate(
    req.params.id,
    { $push: { anggota: req.user?.id } },
    { new: true },
  );

  return res.status(200).json(data);
}

export async function addMembersToRoom(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ pesan: "Unauthorized" });

    const room = await Room.findById(req.params.id).populate("anggota", "email");
    if (!room) return res.status(404).json({ pesan: "Room ID not found." });

    if (room.tipe === "private") {
      return res.status(400).json({ pesan: "Private rooms cannot add members." });
    }

    const hasAccess = (room.anggota as any[]).some((a) => String(a._id ?? a) === req.user?.id);
    if (!hasAccess) {
      return res.status(403).json({ pesan: "You do not have access to this room." });
    }

    const { anggota } = req.body as { anggota?: string[] };
    if (!Array.isArray(anggota) || anggota.length === 0) {
      return res.status(400).json({ pesan: "Please select at least one member." });
    }

    const users = await User.find({ email: { $in: anggota } });
    if (!users.length) return res.status(404).json({ pesan: "Members not found." });

    const existingIds = new Set((room.anggota as any[]).map((a) => String(a._id ?? a)));
    const nextIds = users.map((user) => String(user._id)).filter((id) => !existingIds.has(id));

    if (!nextIds.length) {
      return res.status(400).json({ pesan: "All selected users are already members of this room." });
    }

    const data = await Room.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { anggota: { $each: nextIds } } },
      { new: true },
    ).populate("anggota", "nama email online");

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

export async function exitRoom(req: AuthRequest, res: Response) {
  const room = await Room.findById(req.params.id).populate("anggota", "nama email");
  if (!room) return res.status(404).json({ pesan: "Room ID not found." });

  await Room.findByIdAndUpdate(req.params.id, { $pull: { anggota: req.user?.id } });

  return res.status(200).json({ pesan: "You have left the room." });
}

export async function updateRoom(req: AuthRequest, res: Response) {
  try {
    const { nama } = req.body as { nama?: string };
    const room = await Room.findById(req.params.id);

    if (!room) return res.status(404).json({ pesan: "Room not found." });

    const hasAccess = (room.anggota as any[]).some((a) => String(a) === req.user?.id);
    if (!hasAccess) {
      return res.status(403).json({ pesan: "You do not have permission to edit this room." });
    }

    if (room.tipe === "private") {
      return res.status(400).json({ pesan: "Private rooms cannot be edited." });
    }

    await Room.findByIdAndUpdate(req.params.id, { nama });
    return res.status(200).json({ ...room.toObject(), nama });
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

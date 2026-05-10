import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { Room } from "../models/room.model";
import { Chat } from "../models/chat.model";
import { User } from "../models/user.model";

export async function getRoom(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized", data: null });
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
    const skip = (page - 1) * limit;

    const allRooms = await Room.find({ anggota: { $all: [req.user.id] } })
      .sort({ updatedAt: -1 })
      .populate("anggota", "nama email");
    const totalRooms = allRooms.length;
    const rooms = allRooms.slice(skip, skip + limit);

    const roomDtos = await Promise.all(
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

        const nama = r.tipe === "private" ? (teman as any)?.nama : r.nama;
        const roomDto = {
          _id: r._id,
          nama,
          tipe: r.tipe,
          anggota: r.anggota,
          lastchat: lastchat
            ? {
                totalReadersTarget: lastchat.totalReadersTarget ?? 0,
                _id: lastchat._id,
                pesan: lastchat.pesan,
                namaPengirim: (lastchat.idPengirim as any)?.nama ?? "",
                seenUsers: Array.isArray(lastchat.seenUsers) ? lastchat.seenUsers.length : 0,
              }
            : null,
          updatedAt: r.updatedAt,
          unread: chatsUnread,
          typing: [],
        };

        return roomDto;
      }),
    );

    return res.status(200).json({
      message: "Success get rooms",
      data: {
        totalRooms,
        page,
        rooms: roomDtos,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

export async function addRoom(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized", data: null });

    const { nama, anggota, tipe } = req.body;
    if (!Array.isArray(anggota) || anggota.length === 0) {
      return res.status(404).json({ message: "Please select at least one member.", data: null });
    }

    const users = await User.find({ email: { $in: anggota } });
    if (users.length !== anggota.length) {
      return res.status(404).json({ message: "Some member emails were not found.", data: null });
    }

    if (tipe === "private" && users.length > 1) {
      return res
        .status(400)
        .json({ message: "Private rooms can only invite one member.", data: null });
    }

    const room = await Room.create({
      nama: tipe === "private" ? null : nama,
      anggota: [req.user.id, ...users.map((u) => u._id)],
      tipe,
    });

    return res.status(200).json({ message: "Success create room", data: room });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

export async function joinRoom(req: AuthRequest, res: Response) {
  const room = await Room.findById(req.params.room_id);
  if (!room) return res.status(404).json({ message: "Room ID not found.", data: null });
  if (room.tipe === "private") {
    return res.status(400).json({ message: "Private rooms cannot be joined.", data: null });
  }
  if ((room.anggota as any[]).some((a) => String(a) === req.user?.id)) {
    return res.status(404).json({ message: "You have already joined this room.", data: null });
  }

  const data = await Room.findByIdAndUpdate(
    req.params.room_id,
    { $push: { anggota: req.user?.id } },
    { new: true },
  );

  return res.status(200).json({ message: "Success join room", data });
}

export async function addMembersToRoom(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized", data: null });

    const room = await Room.findById(req.params.room_id).populate("anggota", "email");
    if (!room) return res.status(404).json({ message: "Room ID not found.", data: null });

    if (room.tipe === "private") {
      return res.status(400).json({ message: "Private rooms cannot add members.", data: null });
    }

    const hasAccess = (room.anggota as any[]).some((a) => String(a._id ?? a) === req.user?.id);
    if (!hasAccess) {
      return res.status(403).json({ message: "You do not have access to this room.", data: null });
    }

    const { anggota } = req.body as { anggota?: string[] };
    if (!Array.isArray(anggota) || anggota.length === 0) {
      return res.status(400).json({ message: "Please select at least one member.", data: null });
    }

    const users = await User.find({ email: { $in: anggota } });
    if (!users.length) return res.status(404).json({ message: "Members not found.", data: null });

    const existingIds = new Set((room.anggota as any[]).map((a) => String(a._id ?? a)));
    const nextIds = users.map((user) => String(user._id)).filter((id) => !existingIds.has(id));

    if (!nextIds.length) {
      return res
        .status(400)
        .json({ message: "All selected users are already members of this room.", data: null });
    }

    const data = await Room.findByIdAndUpdate(
      req.params.room_id,
      { $addToSet: { anggota: { $each: nextIds } } },
      { new: true },
    ).populate("anggota", "nama email");

    return res.status(200).json({ message: "Success add members", data });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

export async function exitRoom(req: AuthRequest, res: Response) {
  const room = await Room.findById(req.params.room_id).populate("anggota", "nama email");
  if (!room) return res.status(404).json({ message: "Room ID not found.", data: null });

  await Room.findByIdAndUpdate(req.params.room_id, { $pull: { anggota: req.user?.id } });

  return res.status(200).json({ message: "You have left the room.", data: null });
}

export async function updateRoom(req: AuthRequest, res: Response) {
  try {
    const { nama } = req.body as { nama?: string };
    const room = await Room.findById(req.params.room_id);

    if (!room) return res.status(404).json({ message: "Room not found.", data: null });

    const hasAccess = (room.anggota as any[]).some((a) => String(a) === req.user?.id);
    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "You do not have permission to edit this room.", data: null });
    }

    if (room.tipe === "private") {
      return res.status(400).json({ message: "Private rooms cannot be edited.", data: null });
    }

    await Room.findByIdAndUpdate(req.params.room_id, { nama });
    return res
      .status(200)
      .json({ message: "Success update room", data: { ...room.toObject(), nama } });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

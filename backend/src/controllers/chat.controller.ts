import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { Chat } from "../models/chat.model";
import { Room } from "../models/room.model";

function toChatResponse(chat: any) {
  return {
    _id: String(chat._id),
    pesan: String(chat.pesan ?? ""),
    createdAt: new Date(chat.createdAt).toISOString(),
    pengirim: {
      _id: String(chat.idPengirim?._id ?? ""),
      email: String(chat.idPengirim?.email ?? ""),
      nama: String(chat.idPengirim?.nama ?? ""),
    },
    reply: chat.idChatReply
      ? {
          _id: String(chat.idChatReply._id),
          pesan: String(chat.idChatReply.pesan ?? ""),
          namaPengirim: String(chat.idChatReply.idPengirim?.nama ?? ""),
        }
      : null,
    totalReadersTarget: Number(chat.totalReadersTarget ?? 0),
    seenUsers: (chat.seenUsers ?? []).map((item: any) => ({
      timestamp: new Date(item.timestamp).toISOString(),
      namaUser: String(item.user?.nama ?? ""),
    })),
    isPending: false,
  };
}

export async function addChat(req: AuthRequest, res: Response) {
  try {
    const room = await Room.findById(req.params.room_id).populate("anggota", "nama email");
    if (!room) return res.status(404).json({ message: "Room ID not found.", data: null });
    const hasAccess = (room.anggota as any[]).some((a) => String(a._id) === req.user?.id);
    if (!hasAccess)
      return res.status(403).json({ message: "You do not have access to this room.", data: null });
    const totalReadersTarget = Math.max((room.anggota as any[]).length - 1, 0);
    const chat = await Chat.create({
      idRoom: req.params.room_id,
      pesan: req.body.pesan,
      idPengirim: req.user?.id,
      idChatReply: req.body.idChatReply || null,
      totalReadersTarget,
      seenUsers: [{ user: req.user?.id, timestamp: Date.now() }],
    });
    const populated = await Chat.findById(chat._id)
      .populate("idPengirim", "nama email")
      .populate("seenUsers.user", "nama email")
      .populate({
        path: "idChatReply",
        select: "pesan idPengirim",
        populate: { path: "idPengirim", select: "nama" },
      });
    return res.status(200).json({ message: "Success add chat", data: toChatResponse(populated) });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

export async function delChat(req: AuthRequest, res: Response) {
  const chat = await Chat.findById(req.params.chat_id);
  if (!chat) return res.status(404).json({ message: "Chat ID not found.", data: null });
  if (String(chat.idPengirim) !== req.user?.id)
    return res
      .status(404)
      .json({ message: "You do not have permission to delete this chat.", data: null });
  await Chat.findByIdAndDelete(req.params.chat_id);
  return res.status(200).json({ message: "Success delete chat", data: chat });
}

export async function seen(req: AuthRequest, res: Response) {
  const chatsUpdated = await Chat.find({
    idRoom: req.params.room_id,
    "seenUsers.user": { $ne: req.user?.id },
  });
  const timestamp = Date.now();
  await Chat.updateMany(
    { idRoom: req.params.room_id, "seenUsers.user": { $ne: req.user?.id } },
    { $push: { seenUsers: { user: req.user?.id, timestamp } } },
  );
  return res.status(200).json({
    message: "Success seen chats",
    data: {
      room_id: req.params.room_id,
      chats: chatsUpdated.map((chat) => chat._id),
      addToSeenUsers: {
        user: { _id: req.user?.id, nama: req.user?.nama, email: req.user?.email },
        timestamp,
      },
    },
  });
}

export async function getRoomChats(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized", data: null });
    const roomId = req.params.room_id;
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
    const newestTime = req.query.newest ?? new Date().toISOString();
    const skip = (page - 1) * limit;

    const room = await Room.findById(roomId).populate("anggota", "_id");
    if (!room) return res.status(404).json({ message: "Room ID not found.", data: null });

    const hasAccess = (room.anggota as any[]).some((a) => String(a._id) === req.user?.id);
    if (!hasAccess) {
      return res.status(403).json({ message: "You do not have access to this room.", data: null });
    }

    const totalChats = await Chat.countDocuments({
      idRoom: roomId,
      createdAt: { $lt: newestTime },
    });
    const chatsDesc = await Chat.find({
      idRoom: roomId,
      createdAt: { $lt: newestTime },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("idPengirim", "nama email")
      .populate("seenUsers.user", "nama email")
      .populate({
        path: "idChatReply",
        select: "pesan idPengirim",
        populate: { path: "idPengirim", select: "nama" },
      });

    const chats = chatsDesc.reverse().map((chat: any) => toChatResponse(chat));

    return res.status(200).json({
      message: "Success get chats",
      data: {
        totalChats,
        page,
        chats,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message, data: null });
  }
}

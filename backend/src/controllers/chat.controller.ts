import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { Chat } from "../models/chat.model";
import { Room } from "../models/room.model";

export async function addChat(req: AuthRequest, res: Response) {
  try {
    const room = await Room.findById(req.params.id).populate("anggota", "nama email");
    if (!room) return res.status(404).json({ pesan: "Room ID not found." });
    const hasAccess = (room.anggota as any[]).some((a) => String(a._id) === req.user?.id);
    if (!hasAccess) return res.status(403).json({ pesan: "You do not have access to this room." });
    const chat = await Chat.create({
      idRoom: req.params.id,
      pesan: req.body.pesan,
      idPengirim: req.user?.id,
      idChatReply: req.body.idChatReply || null,
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
    return res.status(200).json(populated);
  } catch (error: any) {
    return res.status(500).json({ pesan: error.message });
  }
}

export async function delChat(req: AuthRequest, res: Response) {
  const chat = await Chat.findById(req.params.id);
  if (!chat) return res.status(404).json({ pesan: "Chat ID not found." });
  if (String(chat.idPengirim) !== req.user?.id)
    return res.status(404).json({ pesan: "You do not have permission to delete this chat." });
  await Chat.findByIdAndDelete(req.params.id);
  return res.status(200).json(chat);
}

export async function seen(req: AuthRequest, res: Response) {
  const chatsUpdated = await Chat.find({
    idRoom: req.params.id,
    "seenUsers.user": { $ne: req.user?.id },
  });
  const timestamp = Date.now();
  await Chat.updateMany(
    { idRoom: req.params.id, "seenUsers.user": { $ne: req.user?.id } },
    { $push: { seenUsers: { user: req.user?.id, timestamp } } },
  );
  return res
    .status(200)
    .json({
      room_id: req.params.id,
      chats: chatsUpdated.map((chat) => chat._id),
      addToSeenUsers: {
        user: { _id: req.user?.id, nama: req.user?.nama, email: req.user?.email },
        timestamp,
      },
    });
}

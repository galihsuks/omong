import { Schema, model, Types } from "mongoose";
import { Room } from "./room.model";

interface ISeenUser {
  timestamp: Date;
  user: Types.ObjectId;
}

interface IChat {
  pesan: string;
  idPengirim: Types.ObjectId;
  idRoom: Types.ObjectId;
  idChatReply: Types.ObjectId | null;
  seenUsers: ISeenUser[];
}

const chatSchema = new Schema<IChat>(
  {
    pesan: { type: String, required: true },
    idPengirim: { type: Schema.Types.ObjectId, ref: "User", required: true },
    idRoom: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    idChatReply: { type: Schema.Types.ObjectId, ref: "Chat", default: null },
    seenUsers: [
      {
        timestamp: { type: Date, default: Date.now },
        user: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true },
);

chatSchema.post("save", async function (doc) {
  if (!doc) return;
  await Room.findByIdAndUpdate(doc.idRoom, { $push: { chats: doc._id } });
});

export const Chat = model<IChat>("Chat", chatSchema);
export type { IChat };

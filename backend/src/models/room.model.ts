import { Schema, model, Types } from "mongoose";

interface IRoom {
  nama: string | null;
  tipe: "group" | "private";
  anggota: Types.ObjectId[];
  chats: Types.ObjectId[];
}

const roomSchema = new Schema<IRoom>(
  {
    nama: { type: String, default: null },
    tipe: { type: String, enum: ["group", "private"], required: true },
    anggota: [{ type: Schema.Types.ObjectId, ref: "User" }],
    chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
  },
  { timestamps: true },
);

export const Room = model<IRoom>("Room", roomSchema);
export type { IRoom };

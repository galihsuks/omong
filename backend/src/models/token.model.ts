import { Schema, model, Types } from "mongoose";

interface IToken {
  content: string;
  ip: string;
  browser: string;
  os: string;
  platform: string;
  idUser: Types.ObjectId;
}

const tokenSchema = new Schema<IToken>(
  {
    content: { type: String, required: true },
    ip: { type: String, required: true },
    browser: { type: String, required: true },
    os: { type: String, required: true },
    platform: { type: String, required: true },
    idUser: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const Token = model<IToken>("Token", tokenSchema);
export type { IToken };

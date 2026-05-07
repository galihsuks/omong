import { Schema, model, Types } from "mongoose";

interface IUser {
  email: string;
  sandi: string;
  nama: string;
  timezone: string;
  online: { status: boolean; last: Date | null };
  token: Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    sandi: { type: String, required: true },
    nama: { type: String, required: true },
    timezone: { type: String, default: "UTC" },
    online: {
      status: { type: Boolean, default: false },
      last: { type: Date, default: null },
    },
    token: [{ type: Schema.Types.ObjectId, ref: "Token" }],
  },
  { timestamps: true },
);

export const User = model<IUser>("User", userSchema);
export type { IUser };

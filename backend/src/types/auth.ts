import { Request } from "express";

export interface AuthPayload {
  id: string;
  email: string;
  nama: string;
  token: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

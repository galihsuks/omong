import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Token } from "../models/token.model";
import { AuthRequest } from "../types/auth";

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ pesan: "Unauthorized" });

  try {
    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as Omit<NonNullable<AuthRequest["user"]>, "token">;
    const checkToken = await Token.findOne({ content: token });
    if (!checkToken) return res.status(401).json({ pesan: "Unauthorized" });
    req.user = { ...payload, token };
    next();
  } catch {
    return res.status(401).json({ pesan: "Unauthorized" });
  }
}

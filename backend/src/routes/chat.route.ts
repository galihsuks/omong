import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { addChat, delChat, getRoomChats, seen } from "../controllers/chat.controller";

export const chatRouter = Router();
chatRouter.get("/room/:room_id", authenticateToken, getRoomChats);
chatRouter.post("/:room_id", authenticateToken, addChat);
chatRouter.delete("/:chat_id", authenticateToken, delChat);
chatRouter.get("/:room_id", authenticateToken, seen);

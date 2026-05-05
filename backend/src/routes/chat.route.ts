import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { addChat, delChat, seen } from "../controllers/chat.controller";

export const chatRouter = Router();
chatRouter.post("/:id", authenticateToken, addChat);
chatRouter.delete("/:id", authenticateToken, delChat);
chatRouter.get("/:id", authenticateToken, seen);

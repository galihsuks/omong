import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  addMembersToRoom,
  addRoom,
  exitRoom,
  getRoom,
  joinRoom,
  updateRoom,
} from "../controllers/room.controller";

export const roomRouter = Router();
roomRouter.get("/join/:id", authenticateToken, joinRoom);
roomRouter.get("/exit/:id", authenticateToken, exitRoom);
roomRouter.post("/members/:id", authenticateToken, addMembersToRoom);
roomRouter.get("/:id", authenticateToken, getRoom);
roomRouter.put("/:id", authenticateToken, updateRoom);
roomRouter.get("/", authenticateToken, getRoom);
roomRouter.post("/", authenticateToken, addRoom);

import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  addMembersToRoom,
  addRoom,
  exitRoom,
  getRoom,
  getRoomById,
  joinRoom,
  updateRoom,
} from "../controllers/room.controller";

export const roomRouter = Router();
roomRouter.get("/join/:room_id", authenticateToken, joinRoom);
roomRouter.get("/exit/:room_id", authenticateToken, exitRoom);
roomRouter.post("/members/:room_id", authenticateToken, addMembersToRoom);
roomRouter.put("/:room_id", authenticateToken, updateRoom);
roomRouter.get("/:room_id", authenticateToken, getRoomById);
roomRouter.get("/", authenticateToken, getRoom);
roomRouter.post("/", authenticateToken, addRoom);

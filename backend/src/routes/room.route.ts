import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { addRoom, exitRoom, getRoom, joinRoom } from "../controllers/room.controller";

export const roomRouter = Router();
roomRouter.get("/join/:id", authenticateToken, joinRoom);
roomRouter.get("/exit/:id", authenticateToken, exitRoom);
roomRouter.get("/:id", authenticateToken, getRoom);
roomRouter.get("/", authenticateToken, getRoom);
roomRouter.post("/", authenticateToken, addRoom);

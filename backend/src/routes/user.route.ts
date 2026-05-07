import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  deleteUser,
  getBy,
  getUserCur,
  searchRoomMemberCandidates,
  updateUser,
} from "../controllers/user.controller";

export const userRouter = Router();
userRouter.get("/", authenticateToken, getUserCur);
userRouter.put("/", authenticateToken, updateUser);
userRouter.delete("/", authenticateToken, deleteUser);
userRouter.post("/getby/:filter", authenticateToken, getBy);
userRouter.post("/room-members/:roomId", authenticateToken, searchRoomMemberCandidates);

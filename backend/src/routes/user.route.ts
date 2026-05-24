import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  deleteUser,
  getUserCur,
  getUserOne,
  getOnlineUsers,
  searchUsers,
  updateUser,
} from "../controllers/user.controller";

export const userRouter = Router();
userRouter.get("/", authenticateToken, getUserCur);
userRouter.put("/", authenticateToken, updateUser);
userRouter.delete("/", authenticateToken, deleteUser);
userRouter.get("/search", authenticateToken, searchUsers);
userRouter.post("/one", getUserOne);
userRouter.post("/online", authenticateToken, getOnlineUsers);

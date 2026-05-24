import { Router } from "express";
import { login, loginByParam, logout, signup } from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth";

export const authRouter = Router();
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/login/:param", loginByParam);
authRouter.post("/logout", authenticateToken, logout);

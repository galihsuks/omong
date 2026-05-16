import express from "express";
import cors from "cors";
import useragent from "express-useragent";
import { authRouter } from "./routes/auth.route";
import { userRouter } from "./routes/user.route";
import { roomRouter } from "./routes/room.route";
import { chatRouter } from "./routes/chat.route";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(useragent.express());

  app.get("/backend", (_req, res) => res.send("API Omong v2"));
  app.use("/backend/auth", authRouter);
  app.use("/backend/user", userRouter);
  app.use("/backend/room", roomRouter);
  app.use("/backend/chat", chatRouter);
  return app;
}

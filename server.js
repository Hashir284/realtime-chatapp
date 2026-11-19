import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDb from "./configuration/db.js";
import cookieParser from "cookie-parser";
import path from "path";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import { app, server } from "./socket/socket.js";

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

const __dirname = path.resolve();
const __frontend = path.join(__dirname, "./Web/dist");
app.use("/", express.static(__frontend));
app.use("/*splat", express.static(__frontend));

const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  connectDb();
  console.log(`Server is running on http://localhost:${PORT}`);
});

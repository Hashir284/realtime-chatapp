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
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

const __dirname = path.resolve();
const __frontend = path.join(__dirname, "./Web/dist");

app.use(express.static(__frontend));
app.get("*", (req, res) => {
  res.sendFile(path.join(__frontend, "index.html"));
});

// Railway PORT env variable use karta hai
const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  connectDb();
  console.log(`Server is running on port ${PORT}`);
});

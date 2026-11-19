import express from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import isAuth from "../middlewares/isAuth.js";

const messageRouter = express.Router();

messageRouter.get("/:id", isAuth, getMessages);
messageRouter.post("/send/:id", isAuth, sendMessage);

export default messageRouter;

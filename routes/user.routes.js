import express from "express";
import { getCurrentUser, getAllUsers } from "../controllers/user.controller.js";
import isAuth from "../middlewares/isAuth.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.get("/all", isAuth, getAllUsers);

export default userRouter;

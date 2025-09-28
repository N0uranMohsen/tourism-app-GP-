import { Router } from "express";
import { search } from "./user.controller.js";

const userRouter = Router();
userRouter.route("/").get(search);

export default userRouter;

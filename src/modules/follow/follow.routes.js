import { Router } from "express";
import { verifyToken } from "../../middleware/authentication.js";
import { follow } from "./follow.controller.js";

const followRouter = Router();
followRouter.route("/addfollow/:id").get(verifyToken, follow); // 👈 correct route

export default followRouter;

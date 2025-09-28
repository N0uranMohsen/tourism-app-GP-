import { Router } from "express";
import { verifyToken } from "../../middleware/authentication.js";
import { createComment, deleteComment, editComment, getAllComments, getOneComment, likeComment, replyComment } from "./comment.controller.js";
import { isValid } from "../../middleware/Validation.js";
import { commentVal } from "./comment.validation.js";

const commentRouter = Router();

commentRouter.route("/addComment/:postId").post(verifyToken, createComment);
commentRouter.route("/editComment/:id").put(verifyToken, editComment);
commentRouter.route("/deleteComment/:id").delete(verifyToken, deleteComment);
commentRouter.route("/likeComment/:id").get(verifyToken, likeComment);
commentRouter.route("/replyComment/:id").post(verifyToken, replyComment);
commentRouter.route("/getAllComments/:id").get(getAllComments);
commentRouter.route("/getComment/:id").get(getOneComment)


export default commentRouter;

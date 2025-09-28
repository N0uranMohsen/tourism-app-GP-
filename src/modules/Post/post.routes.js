import { Router } from "express";
import {
  addLike,
  getAllPosts,
  getOnePost,
  updatePost,
  deletePost,
  searchMention,
  createPost,
  getAllFollowingPosts,
  rePost,

} from "./post.controller.js";
import { fileUpload, fileValidation } from "../../middleware/fileUpload.js";
import { verifyToken } from "../../middleware/authentication.js";

const postRouter = Router();
//postRouter.use(verifyToken)
postRouter
  .route("/addpost")
  .post(
    verifyToken,
    fileUpload({}).fields([
      { name: "image", maxcount: 2, allowFile: fileValidation.image },
    ]),
    createPost
  );
postRouter.route("/mention").get(verifyToken, searchMention);
postRouter.route("/one/:id").get(getOnePost);
postRouter.route("/addlike/:id").get(verifyToken, addLike);
postRouter.route("").get(getAllPosts);

postRouter.route("/updatepost/:id").put(
  verifyToken, //! Ensure the user is logged in.
  fileUpload({}).fields([
    { name: "image", maxcount: 2, allowFile: fileValidation.image },
  ]),
  updatePost
);

postRouter.route("/deletepost/:id").delete(verifyToken, deletePost);

postRouter.route("/followeingposts").get(verifyToken, getAllFollowingPosts);

postRouter.route("/repost/:id").post(verifyToken, rePost);


export default postRouter;

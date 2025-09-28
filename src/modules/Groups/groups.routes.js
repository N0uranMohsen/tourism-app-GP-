import { Router } from "express";
import {
  addAdmins,
  addMembers,
  createGroup,
  editGroup,
  getGroup,
  getGroups,
  removeAdmin,
  removeGroup,
  removeMembers,
} from "./groups.controller.js";
import { verifyToken } from "../../middleware/authentication.js";
import { fileUpload, fileValidation } from "../../middleware/fileUpload.js";
import { createPost, deletePost } from "../Post/post.controller.js";

const groupRouter = Router();

groupRouter.route("/addgroup").post(
  verifyToken,
  fileUpload({}).fields([
    { name: "frontimage", maxcount: 1 },
    { name: "backimage", maxcount: 1 },
  ]),
  createGroup
);
groupRouter
  .route("/addposts/:id")
  .post(
    verifyToken,
    fileUpload({}).fields([
      { name: "image", maxcount: 2, allowFile: fileValidation.image },
    ]),
    createPost
  );
groupRouter.route("/getgroups/").get(getGroups);
groupRouter.route("/getgroup/:groupId").get(verifyToken, getGroup);
groupRouter.route("/addadmins/:id").put(verifyToken, addAdmins);
groupRouter.route("/addmembers/:id").put(verifyToken, addMembers);
groupRouter
  .route("/removeadmins/:groupId/admins/:adminId")
  .delete(verifyToken, removeAdmin);
groupRouter
  .route("/removemembers/:groupId/members/:memberId")
  .delete(verifyToken, removeMembers);
groupRouter
  .route("/removepost/:groupId/posts/:id")
  .delete(verifyToken, deletePost);
groupRouter.route("/removegroup/:groupId").delete(verifyToken, removeGroup);
groupRouter
  .route("/editgroup/:groupId")
  .put(
    verifyToken,
    fileUpload({}).fields([
      { name: "image", maxcount: 2, allowFile: fileValidation.image },
    ]),
    editGroup
  );
export default groupRouter;

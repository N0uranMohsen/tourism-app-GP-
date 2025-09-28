import { Router } from "express";
import {
  deleteUserProfile,

  getAllUsers,

  getuser,

  getUserprofile,
  updateUserProfile,
  userInfo,
} from "./userprofile.controller.js";
import { verifyToken } from "../../middleware/authentication.js";
import { isValid } from "../../middleware/Validation.js";
import { deleteVal, updateVal } from "./userprofile.validation.js";
import {
  fileUpload,
  fileValidation,
  uploadSingleFile,
} from "../../middleware/fileUpload.js";

const userPrRouter = Router();
// userPrRouter.use(verifyToken);
userPrRouter.route("/getAllUsers").get(getAllUsers);
userPrRouter
  .route("/")
  .get(verifyToken, getUserprofile)
  .put(
    verifyToken,
    fileUpload({}).fields([
      { name: "profileimage", maxcount: 1, allowFile: fileValidation.image },
      { name: "backimage", maxcount: 1 },
    ]),
    updateUserProfile
  )
  .delete(verifyToken, isValid(deleteVal), deleteUserProfile);

userPrRouter.route("/:id").get((verifyToken, getuser));

userPrRouter.route("/:id").get((verifyToken, getuser));
userPrRouter.route("userInfo/:id").get(userInfo);
// userPrRouter.route("/:id").get(verifyToken);

export default userPrRouter;

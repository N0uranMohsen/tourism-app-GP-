import { Router } from "express";
import { checkExistance } from "../../middleware/checkMailOrPhone.js";
import {
  changePassword,
  forgotPassword,
  logout,
  resetPassword,
  signin,
  signup,
  verifyOtp,
} from "./auth.controller.js";
import { isValid } from "../../middleware/Validation.js";
import {
  changePasswordVal,
  forgetPasswordVal,
  otpVal,
  resetPasswordVal,
  signinVal,
  signupVal,
} from "../auth/auth.validation.js";

import { verifyToken } from "../../middleware/authentication.js";
// import { signinVal } from "./auth/auth.validation.js";

const authRouter = Router();

//signup
authRouter.route("/signup").post(isValid(signupVal), checkExistance, signup);

//otp
authRouter.route("/otp").post(isValid(otpVal), verifyOtp);

//signin
authRouter.route("/signin").post(isValid(signinVal), signin);

//resetPassword
authRouter
  .route("/resetPassword")
  .put(isValid(resetPasswordVal), verifyToken, resetPassword);

//forogot Password
authRouter
  .route("/forgotPassword")
  .post(isValid(forgetPasswordVal), forgotPassword);

//to change password after forget password
authRouter
  .route("/changePassword")
  .put(isValid(changePasswordVal), changePassword);

//Logout
authRouter.route("/logout").get(verifyToken, logout);

export default authRouter;

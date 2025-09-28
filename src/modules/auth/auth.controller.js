import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../../../DB/models/user.model.js";
import { catchError } from "../../middleware/catchError.js";
import { sendEmail } from "../../middleware/mail.js";
import { AppError } from "../../utils/appError.js";
import { gender, status } from "../../utils/constants/enums.js";
import { msg } from "../../utils/constants/msgs.js";

//====================================signup============================================
export const signup = catchError(async (req, res, next) => {
  //get data from req
  const { firstName, lastName, email, phone, password, DOB, gender } = req.body;
  //check if username exist

  // const usernameExist = await User.findOne({userName});//null ,{}
  // if(userName)
  //   return next(new AppError("user name must be unique"));
  //   const otp = Math.floor(Math.random() * 1000000 + 1).toString();

  // const usernameExist = await User.findOne({userName});//null ,{}
  // if(usernameExist)
  //   return next(new AppError("user name must be unique"));
  const otp = Math.floor(Math.random() * 1000000 + 1).toString();
  const user = new User({
    userName: firstName + " " + lastName,
    firstName,
    lastName,
    email,
    phone,
    password,
    DOB,
    gender,
    otp,
    otpExp: new Date(Date.now() + 10 * 60000),
  });

  const createdUser = await user.save();

  await sendEmail(email, otp);
  if (!createdUser) return next(new AppError(msg.user.failToCreate));
  res.status(201).json({ message: msg.user.sucess, data: createdUser });
});
//==========================OTP verfication==============================================================
export const verifyOtp = catchError(async (req, res, next) => {
  //get data from req
  const { email, otp } = req.body;
  const find = await User.findOne({ $and: [{ email }, { otp }] }); //{},null
  if (!find) return next(new AppError("invalid email or otp"));
  if (find.status == status.VERIFIED)
    return next(new AppError("your acoount is aleady verified..", 409));
  if (new Date() > find.otpExp) {
    return next(new AppError("expired Otp"));
  }
  find.status = status.VERIFIED;
  await find.save();
  res.json({ message: "your account verified sucessfully..!" });
});
//==============================signin==================================================================
export const signin = catchError(async (req, res, next) => {
  //get data from req
  const { email, phone, password } = req.body;

  //check existance
  const findUser = await User.findOne({ $or: [{ email }, { phone }] }); //null,{}
  if (!findUser) return next(new AppError("ivalid email or password", 400));

  if (findUser.status != status.VERIFIED)
    return next(
      new AppError("your must verify your account by otp first", 400)
    );

  if (!findUser || !bcrypt.compareSync(password, findUser.password))
    return next(new AppError("invalid email or password", 400));

  jwt.sign(
    {
      _id: findUser._id,
      email: findUser.email,
      userName: findUser.userName,
    },
    process.env.SECRETKEY,
    async (err, token) => {
      findUser.active = true;
      await findUser.save();
      res.json({ message: "loged in sucessfully", token });
    }
  );
});

//=================================reset Password==================================================================
/**reset password pipe lines
 * -->token
 *--->input (the old password)
 ---->the new pass and must not match the old password
 ------->generate a new token
 ----->the pervois token expired
 
 */

export const resetPassword = catchError(async (req, res, next) => {
  //get data from req
  let { oldPassword, newPassword } = req.body;
  if (oldPassword == newPassword)
    return next(
      new AppError("The new password must be different from the old password")
    );
  //check user existance

  const user = await User.findById(req.user._id); //{},null
  if (!user) return next(new AppError(msg.user.notFound, 404));

  if (user && bcrypt.compareSync(oldPassword, user.password)) {
    newPassword = bcrypt.hashSync(newPassword, 8);

    jwt.sign(
      {
        _id: user._id,
        email: user.email,
        userName: user.userName,
      },
      process.env.SECRETKEY,
      async (err, token) => {
        user.password = newPassword;
        user.passwordChangedAt = Date.now();
        await user.save();
        res
          .status(200)
          .json({ message: "your password updated sucessfully", token });
      }
    );
  } else
    return next(
      new AppError("the old password doesnt match your actual password", 400)
    );
});

//============================forget password================================================================
/** forget password pipe-lines
 *like linkedin
 00- make email status=pending ,active=false
 1- send otp to verify account 
 2- generate token to allow user update password
 3-then make user avtive = true
 */

export const forgotPassword = catchError(async (req, res, next) => {
  //get data from req
  const { email } = req.body;
  //checkexistance
  const user = await User.findOne({ email }); //{},null
  if (!user) return next(new AppError(msg.user.notFound, 404));

  user.status = status.PENDING;
  user.active = false;
  user.passwordChangedAt = Date.now();
  await user.save();
  sendEmail(email);
  res.status(200).json({
    message: "check your mail to verify your account and change password"
  });
});

export const changePassword = catchError(async (req, res, next) => {
  //get data from req
  let { newPassword, email } = req.body;
  //check user existance
  const user = await User.findOne({ email }); //{},null
  // const user = await User.findById(req.user._id)//{},null
  if (!user) return next(new AppError(msg.user.notAllowed, 400));
  newPassword = bcrypt.hashSync(newPassword, 8);
  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  // user.active=true;
  await user.save();

  res
    .status(201)
    .json({ message: "your password changed successfully... login" });
});

//============================================Logout====================================================================
/**
 * logout pipe Line
 * active-->false
 * token -->expired
 */
export const logout = catchError(async (req, res, nex) => {
  //check user existance
  const user = await User.findById(req.user._id); //null,{}
  if (!user) return nex(new AppError(msg.user.notFound, 404));
  user.active = false;
  user.logoutAt = Date.now();
  res.status(200).json({ message: "user loged out successfully..." });
});

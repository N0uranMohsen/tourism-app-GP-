import { User } from "../../DB/models/user.model.js";
import { AppError } from "../utils/appError.js";
import { status } from "../utils/constants/enums.js";
import { msg } from "../utils/constants/msgs.js";
import jwt from "jsonwebtoken";
import { catchError } from "./catchError.js";

// export const isAuthenticated = () => {
//   return async (req, res, next) => {
//     const { token } = req.headrs;
//     if (!token) return next(new AppError("token must be provided", 400));
//     let result = verifyToken({ token, secretKey: process.env.SECRETKEY });
//     if (result.message) return next(new AppError(result.message));
//     //check user exitance
//     const user = await User.findOne({
//       _id: result._id,
//       status: status.VERIFIED,
//     }); //{},null
//     if (!user) return next(new AppError(msg.user.notFound, 401));
//     req.user = user;
//     next();
//   };
// };
export const verifyToken = catchError(async (req, res, next) => {
  const { token } = req.headers;
  let payload = "";
  // console.log(token,"\n");
  
  if (!token) return next(new AppError("token must be provided...", 401));
  jwt.verify(token, process.env.SECRETKEY, async (err, decoded) => {
    // console.log(process.env.SECRETKEY);

    if (err) {
      // console.log(err);
      return next(new AppError("invalid token...", 401));
    }
    payload = decoded;
  });

  let user = await User.findById(payload._id); //{},null
  if (!user) return next(new AppError(msg.user.notFound, 401));
  if (user.passwordChangedAt) {
    
    let time = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (time > payload.iat) return next(new AppError("invalid token", 401));
  }
  if (user.logoutAt) {
    
    let time = parseInt(user.logoutAt.getTime() / 1000);
    if (time > payload.iat) return next(new AppError("invalid token", 401));
  }
  req.user = payload;
  // console.log(payload);
  
  next();
});

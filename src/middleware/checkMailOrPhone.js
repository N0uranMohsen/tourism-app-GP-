import { User } from "../../DB/models/user.model.js";
import { AppError } from "../utils/appError.js";
import { status } from "../utils/constants/enums.js";
import { msg } from "../utils/constants/msgs.js";
import { catchError } from "./catchError.js";
import bcrypt from "bcrypt";
export const checkExistance = catchError(async (req, res, next) => {
  await User.findOneAndDelete({
    $or:[
    {email: req.body.email},{phone:req.body.phone}],
    status: status.PENDING,
  });
  const isFound = await User.findOne({
    $or: [{ email: req.body.email }, { phone: req.body.phone }],
  });
  if (isFound) return next(new AppError(msg.user.alreadyExist, 409));
  req.body.password = bcrypt.hashSync(req.body.password, 8);

  next();
});

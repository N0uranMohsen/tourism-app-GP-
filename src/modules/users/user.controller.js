import { User } from "../../../DB/models/user.model.js";
import { catchError } from "../../middleware/catchError.js";

export const search = catchError(async (req, res, next) => {
  if (req.query.search) {
    let user = await User.find({
      userName: { $regex: req.query.search, $options: "i" },
    }).select("_id userName profileImage firstName lastName");
    return res.status(201).json({ message: "success", user });
  }
  res.status(200).json({ message: "there is no user to search for" });
});

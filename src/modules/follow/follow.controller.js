import { User } from "../../../DB/models/user.model.js";
import { catchError } from "../../middleware/catchError.js";
import { AppError } from "../../utils/appError.js";
import { msg } from "../../utils/constants/msgs.js";

const follow = catchError(async (req, res, next) => {
  let userFollowing = await User.findById(req.params.id);
  let user = await User.findById(req.user._id);

  //cheack if there is user
  if (!userFollowing) return next(new AppError(msg.user.notFound, 404));

  //remove the id from the list if it exist
  if (
    userFollowing.followers.includes(req.user._id) &&
    user.following.includes(req.params.id)
  ) {
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user._id },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: req.params.id },
    });

    //know how much followers and following
    let userFollowing = await User.findById(req.params.id);
    userFollowing.followersCount = userFollowing.followers.length;
    user.followingCount = user.following.length;
    await userFollowing.save();
    await user.save();
    return res.status(201).json(user);
  }

  //add follow to others
  user.following.push(req.params.id);
  userFollowing.followers.push(req.user._id);
  userFollowing.followersCount = userFollowing.followers.length;
  user.followingCount = user.following.length;
  await userFollowing.save();
  await user.save();
  res.status(201).json(user);
});

export { follow };

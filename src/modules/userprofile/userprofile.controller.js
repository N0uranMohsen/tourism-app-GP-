import { User } from "../../../DB/models/user.model.js";
import { catchError } from "../../middleware/catchError.js";
import bcrypt from "bcrypt";
import { AppError } from "../../utils/appError.js";

import { deleteImage, uploadToImageKit } from "../../middleware/fileUpload.js";
import { msg } from "../../utils/constants/msgs.js";
import { Post } from "../../../DB/models/post.model.js";
import { Comment } from "../../../DB/models/comment.model.js";


//==============================get user profile====================================

const getuser = catchError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError(msg.user.notFound, 404));
  const posts = await Post.find({ createdBy: user._id }).populate([
    { path: "likes", select: "userName profileImage" },
    {
      path: "comments",
      select: "createdBy description createdAt likes",
      populate: {
        path: "createdBy",
        model: "User",
        select: "userName profileImage",
      },
    },
  ]);
  res.status(201).json({ msg: "success.", user, posts });
});

const getUserprofile = catchError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  !user ||
    res.status(201).json({
      msg: "success.",
      user: {
        userId: user._id,
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        DOB: user.DOB,
        gender: user.gender,
        bio: user.bio,
        profileImage: user.profileImage,
        location: user.location,
        backGroungImage: user.backGroungImage,
        followers: user.followers,
        following: user.following,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
      },
    });
    
  user || next(new AppError("there is no date.", 404));
});
//===================get all user=====================
/* return all users{_id,profileImage,username}
 */
export const getAllUsers = catchError(async (req, res, next) => {
  const users = await User.find().select("userName profileImage"); //.lean();//{},null
  if (!users) return next(new AppError(msg.user.notFound, 404));
  res.status(200).json({ message: "sucess", data: users });
});
//====================update user profile =========================================================
const updateUserProfile = catchError(async (req, res, next) => {
  if (req.files.profileimage && req.files.profileimage[0]) {
    const user = await User.findById(req.user._id);
    await deleteImage(user.profileimageId);
    const uploadResult = await uploadToImageKit(
      req.files.profileimage[0],
      "users"
    );
    req.body.profileImage = uploadResult.name;
    req.body.profileimageId = uploadResult.fileId;
  }
  if (req.files.backimage && req.files.backimage[0]) {
    const user = await User.findById(req.user._id);
    await deleteImage(user.backGroungimageId);
    const uploadResult = await uploadToImageKit(
      req.files.backimage[0],
      "users"
    );
    req.body.backGroungImage = uploadResult.name;
    req.body.backGroungimageId = uploadResult.fileId;
  }

  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });
  !user || res.status(201).json({ msg: "updated." });
  user || next(new AppError("there is no date.", 404));
});
//=====================delete user profile===========================================================
const deleteUserProfile = catchError(async (req, res, next) => {
  let finduser = await User.findById(req.user._id);
  if (!req.body.password)
    return next(new AppError("plaese enter the password", 404));
  else if (bcrypt.compareSync(req.body.password, finduser.password)) {
    await User.findByIdAndDelete(req.user._id);
    !finduser || res.status(201).json({ msg: "deleted." });
    finduser || next(new AppError("there is no date.", 404));
  } else return next(new AppError("wrong password.", 401));
});
//=======================ai api ==========================================
export const userInfo = catchError(async (req, res, next) => {
  //get data
  const { id } = req.params;
  //check user existance
  const user = await User.findById(id);
  if (!user) return next(new AppError(msg.user.notFound, 404));
  //_id description tags
  const postTag = await Post.find({ createdBy: id }).select("-_id tag").lean();
  const postdesc = await Post.find({ createdBy: id })

    .select("description")

    .lean();
  // posts that the user liked
  const likedPosts = await Post.find({ likes: id }).select("_id").lean();
  //comments that the user made
  const comments = await Comment.find({ createdBy: id })
    .select("-_id description")
    .lean();

  res.status(200).json({
    message: "sucess",
    data: {
      userId: id,
      interests: {
        posts: postdesc,
        tags: postTag,
        likedPosts: likedPosts,
        comments: comments,
      },
    },
  });
  // res.status(200).json({message:"sucess",data:postTag});
});



export { getuser, getUserprofile, updateUserProfile, deleteUserProfile };

import { Comment } from "../../../DB/models/comment.model.js";
import { Notification } from "../../../DB/models/notification.model.js";
import { Post } from "../../../DB/models/post.model.js";
import { io } from "../../../index.js";
import { catchError } from "../../middleware/catchError.js";
import { AppError } from "../../utils/appError.js";
import { msg } from "../../utils/constants/msgs.js";

//======================create comment===================================
export const createComment = catchError(async (req, res, next) => {
  //check post existance
  const postExistance = await Post.findById(req.params.postId);
  if (!postExistance) return next(new AppError(msg.post.notFound, 404));
  if (!req.body.description)
    return next(new AppError("comment must have content or description", 404));
  const comment = new Comment({
    post: req.params.postId,
    createdBy: req.user._id,
    createdAt: Date.now(),
    description: req.body.description,
  });
  const isCreated = await comment.save();
  if (!isCreated) return next(new AppError(msg.comment.failToCreate, 409));
  // console.log(postExistance.createdBy);
  //===============create notificatio using socket io==============
  const notification = new Notification({
    sender: req.user._id,
    reciever: postExistance.createdBy,
    message: `${req.user._id} make a comment in your post`,
    type: "comment",
    post: req.params.postId,
  });
  await notification.save();
  let x = "lll";
  x.toString();
  //  ============send notification ========
  io.to(postExistance.createdBy.toString()).emit(
    "CreateCommentNotification",
    notification.toJSON()
  );

  res.status(201).json({ message: msg.comment.sucess, data: isCreated });
});
///==============edit Comment======================
export const editComment = catchError(async (req, res, next) => {
  //check comment existance
  const commentExistance = await Comment.findById(req.params.id);
  if (!commentExistance) return next(new AppError(msg.comment.notFound, 404));
  //Checking if the comment belongs to the authenticated user
  if (!commentExistance.createdBy.equals(req.user._id))
    return next(new AppError("This  comment can only edit by author", 404));
  if (!req.body.description)
    return next(new AppError("must have content", 404));

  const updateComment = await Comment.findByIdAndUpdate(
    req.params.id,
    {
      description: req.body.description,
      isEdited: true,
      updatedAt: Date.now(),
    },
    { new: true }
  );
  res.status(200).json({ message: msg.comment.updated, data: updateComment });
});
//===================delete comment====================================
export const deleteComment = catchError(async (req, res, next) => {
  //check  comment existance
  const commentExistance = await Comment.findById(req.params.id);
  if (!commentExistance) return next(new AppError(msg.comment.notFound, 404));
  //Checking if the comment belongs to the authenticated user
  if (!commentExistance.createdBy.equals(req.user._id))
    return next(new AppError("This  comment can only delete by author", 404));
  const delteComment = await Comment.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: msg.comment.deleted, data: deleteComment });
});
//======================like comment==============
export const likeComment = catchError(async (req, res, next) => {
  //check comment existnace
  const commentExistance = await Comment.findById(req.params.id);
  if (!commentExistance) return next(new AppError(msg.comment.notFound, 404));
  //check if the user is alerdy liked this comment--> dislike
  const alreadyLiked = commentExistance.likes.includes(req.user._id);
  let message = "the comment is ";
  if (alreadyLiked) {
    commentExistance.likes.pull(req.user._id);
    message += "dislike sucessfully";
  } else {
    commentExistance.likes.push(req.user._id);
    message += "like sucessfully";
  }
  await commentExistance.save();
  res.status(200).json({ message, data: commentExistance });
});
//=======================reply comment=============
export const replyComment = catchError(async (req, res, next) => {
  //check comment existance
  const commentExistance = await Comment.findById(req.params.id);
  if (!commentExistance) return next(new AppError(msg.comment.notFound, 404));
  commentExistance.reply.push({
    description: req.body.description,
    createdBy: req.user._id,
    createdAt: Date.now(),
  });
  await commentExistance.save();
  res.status(200).json({ message: msg.comment.sucess, data: commentExistance });
});
//==================get all comments of specific post================================
export const getAllComments = catchError(async (req, res, next) => {
  //check post existance
  const postExistance = await Post.findById(req.params.id);
  if (!postExistance) return next(new AppError(msg.post.notFound, 404));
  const comments = await Comment.find({ post: req.params.id }).populate(
    "createdBy",
    "name email userName profileImage"
  ); //{}

  res.status(200).json({ message: "sucess", data: comments });
});
//==================get one comment=================================================
export const getOneComment = catchError(async (req, res, next) => {
  //check comment existance
  const comment = await Comment.findById(req.params.id).populate(
    "createdBy",
    "userName profileImage"
  );
  if (!comment) return next(new AppError("this comment not found", 404));
  res.status(200).json({ message: msg.comment.sucess, data: comment });
});

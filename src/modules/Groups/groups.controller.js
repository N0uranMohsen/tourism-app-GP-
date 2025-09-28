import { Group } from "../../../DB/models/groups.model.js";
import { Post } from "../../../DB/models/post.model.js";
import { catchError } from "../../middleware/catchError.js";
import { uploadToImageKit } from "../../middleware/fileUpload.js";
import { AppError } from "../../utils/appError.js";

//=====================get groups===========================================
const getGroups = catchError(async (req, res, next) => {
  let groups = await Group.find().select(
    "coverImages name description createdBy"
  );
  res.status(201).json({ msg: "success", groups });
});
//=====================get group===========================================
const getGroup = catchError(async (req, res, next) => {
  let group = await Group.findById(req.params.groupId);
  // if (group.members.includes(req.user._id)) {
  let fullgroup = await Group.findById(req.params.groupId)
    .populate({
      path: "posts",
      select: "createdBy description likes tag mention createdAt images",
      populate: {
        path: "createdBy",
        select: "userName profileImage",
      },
      populate: {
        path: "comments", // Populating the 'comments' array
        populate: {
          path: "createdBy", // Populating the 'createdBy' for each comment
          select: "userName profileImage",
        },
      },
    })
    .populate({
      path: "createdBy members admins",
      select: "userName profileImage",
    });
  res.status(201).json({ msg: "success", fullgroup });
  // } else {
  //   let fullgroup = await Group.findById(req.params.groupId)
  //     .select("coverImages name description admins members createdBy")
  //     .populate({
  //       path: "createdBy members admins",
  //       select: "userName profileImage",
  //     });
  //   res.status(201).json({ msg: "success", fullgroup });
  // }
});
//=====================create groups===========================================
const createGroup = catchError(async (req, res, next) => {
  let group = new Group({
    name: req.body.name,
    createdBy: req.user._id,
    admins: req.user._id,
    members: req.user._id,
    description: req.body.description,
  });
  if (req.files.frontimage && req.files.frontimage[0]) {
    const uploadResult = await uploadToImageKit(
      req.files.frontimage[0],
      "groups"
    );
    group.coverImages.frontImage = uploadResult.name;
    group.coverImages.frontImageId = uploadResult.fileId;
  }
  if (req.files.backimage && req.files.backimage[0]) {
    const uploadResult = await uploadToImageKit(
      req.files.backimage[0],
      "groups"
    );
    group.coverImages.backgroundImage = uploadResult.name;
    group.coverImages.backgroundImageId = uploadResult.fileId;
  }
  group = await group.save();
  res.status(201).json({ message: "Group created successfully", group });
});

//=====================add admins to group===========================================
const addAdmins = catchError(async (req, res, next) => {
  let group = await Group.findById(req.params.id);
  if (!group) return next(new AppError("Group not found", 404));
  if (group.createdBy.toString() !== req.user._id.toString()) {
    return next(new AppError("Unauthorized", 401));
  }
  const updatedGroup = await Group.findByIdAndUpdate(
    req.params.id,
    {
      $addToSet: { admins: req.body.admins, members: req.body.admins },
    },
    { new: true }
  ).populate({
    path: "createdBy members admins",
    select: "userName profileImage",
  });
  res.status(201).json({ msg: "Admins added", updatedGroup });
});

//=====================delete admins from groups===========================================
const removeAdmin = catchError(async (req, res, next) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) return next(new AppError("Group not found", 404));
  if (group.createdBy.toString() !== req.user._id.toString())
    return next(new AppError("Unauthorized", 401));

  let updatedGroup = await Group.findByIdAndUpdate(
    req.params.groupId,
    {
      $pull: { admins: req.params.adminId },
    },
    { new: true }
  ).populate({
    path: "createdBy members admins",
    select: "userName profileImage",
  });
  res.status(201).json({ msg: "Admin removed", updatedGroup });
});
//=====================add members to group===========================================
const addMembers = catchError(async (req, res, next) => {
  let group = await Group.findById(req.params.id);
  if (!group) return next(new AppError("Group not found", 404));
  if (group.admins.includes(req.user._id)) {
    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { members: { $each: req.body.members } },
      },
      { new: true }
    ).populate({
      path: "createdBy members admins",
      select: "userName profileImage",
    });
    res.status(201).json({ msg: "Members added", updatedGroup });
  } else return next(new AppError("Unauthorized", 401));
});
//=====================remove members to group===========================================
const removeMembers = catchError(async (req, res, next) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) return next(new AppError("Group not found", 404));
  if (
    !group.admins.includes(req.user._id) ||
    group.createdBy.toString() !== req.params.memberId
  ) {
    return next(new AppError("Unauthorized", 401));
  }
  let updatedGroup = await Group.findByIdAndUpdate(
    req.params.groupId,
    {
      $pull: { members: req.params.memberId, admins: req.params.memberId },
    },
    { new: true }
  ).populate({
    path: "createdBy members admins",
    select: "userName profileImage",
  });
  res.status(201).json({ msg: "members removed", updatedGroup });
});
//=====================Edit Group===========================================
const editGroup = catchError(async (req, res, next) => {
  let group = await Group.findById(req.params.groupId);
  if (!group) return next(new AppError("Group not found", 404));
  if (!group.admins.includes(req.user._id))
    return next(new AppError("Unauthorized", 401));
  let updatedGroup = await Group.findByIdAndUpdate(
    req.params.groupId,
    req.body,
    { new: true }
  );
  console.log("REQ.BODY:", req.body);

  res.status(201).json({ msg: "Updated", updatedGroup });
});
//=====================Remove Group===========================================
const removeGroup = catchError(async (req, res, next) => {
  let group = await Group.findById(req.params.groupId);
  if (!group) return next(new AppError("Group not found", 404));
  if (!group.admins.includes(req.user._id))
    return next(new AppError("Unauthorized", 401));
  await Group.findByIdAndDelete(req.params.groupId);
  res.status(201).json({ msg: "Deleted" });
});
export {
  createGroup,
  addAdmins,
  removeAdmin,
  addMembers,
  removeMembers,
  getGroup,
  getGroups,
  editGroup,
  removeGroup,
};
  
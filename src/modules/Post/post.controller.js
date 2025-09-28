import { Post } from "../../../DB/models/post.model.js";
import { User } from "../../../DB/models/user.model.js";
import { catchError } from "../../middleware/catchError.js";
import { deleteImage, uploadToImageKit } from "../../middleware/fileUpload.js";
import { AppError } from "../../utils/appError.js";
import { msg } from "../../utils/constants/msgs.js";
import { Notification } from "../../../DB/models/notification.model.js";
import axios from "axios";
import { Client } from "@gradio/client";
import { Recommendations } from "../../../DB/models/recommendation.mode.js";
import { log } from "console";
import mongoose from "mongoose";
import { Group } from "../../../DB/models/groups.model.js";

//Get Post
const getOnePost = catchError(async (req, res, next) => {
  let post = await Post.findById(req.params.id)
    .populate({
      path: "comments", // Populating the 'comments' array
      populate: {
        path: "createdBy", // Populating the 'createdBy' for each comment
        select: "userName profileImage",
      },
    })
    .populate("repostedFrom", "userName profileImage");
  if (!post) return next(new AppError("there is no post", 404));
  let user = await User.findById(post.createdBy);
  let username = user.userName;
  let profileimg = user.profileImage;
  res.status(201).json({ message: "success", post, username, profileimg });
});

//=====================Create Post===========================================
const createPost = catchError(async (req, res, next) => {
  const { description="", tag, mention } = req.body;

  // const aiResponse = await axios.post('https://sentimentmultilingual-production.up.railway.app/predict/', {
  //   text: description
  // }, {
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // });

  //   const sentiment = aiResponse.data.sentiment;
  // console.log(aiResponse.data.label);

  //     if (aiResponse.data.label === 'Very Negative' || aiResponse.data.label === 'Negative' ) {
  //       return next(new AppError("Your post has some bad words. Please change it", 400));

  //     }
const clientt = await Client.connect("Mohamedgodz/sentiment-api");
const resultt = await clientt.predict("/predict", { 		
		text: description, 
});

const sentiment = resultt.data[0].label;
// console.log(sentiment);

// console.log(resultt.data);

if (sentiment === "Negative" || sentiment === "Very Negative") {
  return next(new AppError("Your post has some bad words. Please change it", 400));
}
  let post = new Post({
    description,
    createdBy: req.user._id,
    createdAt: Date.now(),
    tag,
    mention,
  });
  //check if user send image or not!
  if (req.files) {
    let arr = req.files.image;
    for (let i in arr) {
      if (req.files.image && req.files.image[i]) {
        const uploadResult = await uploadToImageKit(
          req.files.image[i],
          "posts"
        );
        post.images.push({
          imageId: uploadResult.fileId,
          image: uploadResult.name,
        });
      }
    }
  }
  if (req.originalUrl.includes("group")) {
    if (!req.params.id) {
      return next(new AppError("Group ID is required in URL", 400));
    }
    let group = await Group.findById(req.params.id);
    if (!group) {
      return next(new AppError("Group not found", 404));
    }
    group.posts.push(post._id);
    await group.save();
  }
  await post.save();
  let recommendations = [];
  const client = await Client.connect("Mohamedgodz/Recommendation_grad");
  const result = await client.predict("/predict", {
    user_id: req.user._id.toString(),
    new_post: description,
  });

  recommendations = result.data; //.map(item => item.trim()).filter(Boolean);
  // Convert raw string recommendations to array of objects
  //   recommendations = recommendations.map(str => {
  //   const idMatch = str.match(/ID:\s*([a-f0-9]+)/i);
  //   const tagMatch = str.match(/Tag:\s*([^|]*)/i);
  //   const textMatch = str.match(/Text:\s*(.*)/i);

  //   return {
  //     id: idMatch ? idMatch[1].trim() : "",
  //     tag: tagMatch ? tagMatch[1].trim() : "",
  //     text: textMatch ? textMatch[1].trim() : ""
  //   };
  // });
  // handle case where recommendations[0] is a big string
  let rawRecommendations = [];

  if (
    typeof recommendations[0] === "string" &&
    recommendations[0].includes("ID:")
  ) {
    rawRecommendations = recommendations[0].split("\n\n");
  } else {
    rawRecommendations = recommendations;
  }

  // convert each line to object
  const formattedRecommendations = rawRecommendations.map((str) => {
    const idMatch = str.match(/ID:\s*([a-f0-9]+)/i);
    const tagMatch = str.match(/Tag:\s*([^|]*)/i);
    const textMatch = str.match(/Text:\s*(.*)/i);

    return {
      id: idMatch ? idMatch[1].trim() : "",
      tag: tagMatch ? tagMatch[1].trim() : "",
      text: textMatch ? textMatch[1].trim() : "",
    };
  });

  //check if user has recommendation posts before
  const recExist = await Recommendations.findOne({user:req.user._id});
  if (!recExist) {
    
    const rec = new Recommendations({
      user: req.user._id,
      post: post._id,
      recommendations: formattedRecommendations,
    });
    await rec.save();
  } 
  else {
     
    recExist.recommendations.push(...formattedRecommendations);
    await recExist.save();
  }
  //console.log("🔍 result from Gradio:", recommendations);
  //console.log("//////////////////////////////////////\\n");
  // console.log(typeof recommendations);
  res.status(201).json({
    message: "success",
    //Sentemint :sentiment,
    post,
    formattedRecommendations,
    lent: formattedRecommendations, 
  });
});

//============================search for mentions========================

export const searchMention = catchError(async (req, res, next) => {
  const { name } = req.query;
  if (!name) return next(new AppError("no names sent !", 404));
  const users = await User.find({
    userName: { $regex: "^" + name, $options: "i" },
  }).select("_id userName  profileImage");
  // const users=  await User.find().select("userName")
  res.status(200).json({ message: "sucess", data: users });
});

//=======================addLike==============================

const addLike = catchError(async (req, res, next) => {
  //check post existance

  let post = await Post.findById(req.params.id); //{},null
  if (!post) return next(new AppError(msg.post.notFound, 404));

  if (post.likes.includes(req.user._id)) {
    await Post.findByIdAndUpdate(req.params.id, {
      $pull: { likes: req.user._id },
    });

    post = await Post.findById(req.params.id);
    post.likescount = post.likes.length;
    await post.save();

    return res.status(201).json(post);
  }
  post.likes.push(req.user._id);
  post.likescount = post.likes.length;
  await post.save();

  //===================create notification using socket io========================
  // const notification = new Notification({
  //   sender: req.user._id,
  //   reciever: post.createdBy,
  //   message: `${req.user._id} like your post`,
  //   post: post._id,
  // });
  // await notification.save();
  // //===========send the notification yo post author============
  // io.to(post.createdBy.toString()).emit(
  //   "createLikeNotification",
  //   notification.toJSON()
  // );
  res.status(201).json(post);
});
//=======================repost==============================
const rePost = catchError(async (req, res, next) => {
  let post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("there no post", 404));
  const postData = post.toObject();
  delete postData._id;
  let newPost = new Post({
    ...postData,
    repostedFrom: post.createdBy,
    createdBy: req.user._id,
    createdAt: Date.now(),
  });

  await newPost.save();
  res.status(201).json({ message: "success" });
});

//=======================get All Posts===============================================

const getAllPosts = catchError(async (req, res, next) => {
  let { page, size, sort, ...filter } = req.query;

  if (!sort) {
    sort = "-createdAt";
  }
  if (!page || page <= 0) {
    page = 1;
  }
  if (!size || size <= 0) {
    size = 1;
  }
  page = parseInt(page);
  size = parseInt(size);
  let skip = (page - 1) * size;
  sort = sort?.replaceAll(",", " ");

  const posts = await Post.find(filter)
    .limit(size)
    .skip(skip)
    .sort(sort)
    .populate("repostedFrom", "userName profileImage")
    .populate("createdBy", "userName profileImage")
    .populate({
      path: "comments", // Populating the 'comments' array
      populate: {
        path: "createdBy", // Populating the 'createdBy' for each comment
        select: "userName profileImage",
      },
    });

  return res.status(200).json({ message: "sucess", posts });
});
//========get all posts of users that user follow===========================================
// export const  getAllFollowingPosts = catchError(async (req, res, next) => {
//   let { page, size, sort, ...filter } = req.query;
//   if (!sort) sort = "-createdAt";
//   if (!page || page <= 0) page = 1;
//   if (!size || size <= 0) size = 10;

//   page = parseInt(page);
//   size = parseInt(size);
//   let skip = (page - 1) * size;
//   sort = sort.replaceAll(",", " ");

//   // get user following list
//   const userFollowing = await User.findById(req.user._id).select("following");
//   const followeingList = userFollowing?.following || [];

//   // get recommendation posts
//  // const userRecomm = await Recommendations.findOne({ user: req.user._id });
//   //const recommendedPostIds = userRecomm?.recommendations?.map((rec) => rec.id) || [];
// // const recommendedPostIds = userRecomm?.recommendations
// //   ?.map((rec) => rec.id)
// //   .filter(id => id && id.trim() !== "") || [];

// //   if (followeingList.length || recommendedPostIds.length) {
// //     postFilter = {
// //       ...filter,
// //       $or: [
// //         { createdBy: { $in: followeingList } },
// //         { _id: { $in: recommendedPostIds } },
// //       ],
// //     };
// //   }
// //   console.log(postFilter)
//  let postFilter = filter ;
//    if (followeingList.length > 0) {
//     postFilter = {
//       ...filter,
//       createdBy: { $in: followeingList },
//     };
//   }

//   else {
//     postFilter ={}
//   }

//   console.log(postFilter)

//   const posts = await Post.find(postFilter)
//     .limit(size)
//     .skip(skip)
//     .sort(sort)
//     .populate("createdBy", "userName profileImage")
//     .populate({
//       path: "comments",
//       populate: {
//         path: "createdBy",
//         select: "userName profileImage",
//       },
//     });

//   return res.status(200).json({ message: "success", posts });
// });
export const getAllFollowingPosts = catchError(async (req, res, next) => {
  let { page, size, sort, ...filter } = req.query;

  if (!sort) {
    sort = "-createdAt";
  }
  if (!page || page <= 0) {
    page = 1;
  }
  if (!size || size <= 0) {
    size = 1;
  }
  page = parseInt(page);
  size = parseInt(size);
  let skip = (page - 1) * size;
  sort = sort?.replaceAll(",", " ");

  //check if user following list
  const user = await User.findById(req.user._id); //.select("following");
  //console.log(user.email, user._id, user.userName);

  if (!user) return next(new AppError(msg.user.notFound, 404));
  const recom = await Recommendations.findOne({ user: req.user._id });
  //console.log(recom.recommendations);
  // const recommendationIds = recom.recommendations.map((rec) => rec.id);
  // const recommendationIds = recom.recommendations.map(r => new mongoose.Types.ObjectId(r.id));
  let recommendationIds = [];
  if (recom) {
    recommendationIds = recom.recommendations
      .map((r) => r.id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    //console.log(recommendationIds);
  }

  /**
   * const posts = await Post.find({
    $and: [
    $or[
      { createdBy: { $in: user.following } },
      { _id: { $in: recommendationIds } },],
       $or[
      
      { _id: { $in: recommendationIds } },
       { createdBy: { $in: user.following } },],

    ],
  })
   */
  let query = {};

  if (user.following.length && recommendationIds.length) {
    query = {
      $or: [
        { createdBy: { $in: user.following } },
        { _id: { $in: recommendationIds } },
      ],
    };
  } else if (user.following.length) {
    query = { createdBy: { $in: user.following } };
  } else if (recommendationIds.length) {
    query = { _id: { $in: recommendationIds } };
  } else {
    query = { _id: null };
  }
  const posts = await Post.find(query)
    .limit(size)
    .skip(skip)
    .sort(sort)
    .populate("repostedFrom", "userName profileImage")
    .populate("createdBy", "userName profileImage")
    .populate({
      path: "comments", // Populating the 'comments' array
      populate: {
        path: "createdBy", // Populating the 'createdBy' for each comment
        select: "userName profileImage",
      },
    });
  return res.json({ message: "sucess", data: posts });
});

//!=====================Update Post===========================================

const updatePost = catchError(async (req, res, next) => {
  const { id } = req.query;
  const { description, tag } = req.body;

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  if (!post.createdBy.equals(req.user._id))
    return next(new AppError("unauthorized user", 403));

  if (description) post.description = description;
  if (tag) post.tag = tag;

  if (req.files) {
    let arr = req.files.image;
    for (let i in arr) {
      if (req.files.image && req.files.image[i]) {
        console.log("lala");

        if (req.query) {
          // console.log(id);

          deleteImage(id);
          //images.pull()
        }
        const uploadResult = await uploadToImageKit(
          req.files.image[i],
          "posts"
        );
        post.images.push({
          imageId: uploadResult.fileId,
          image: uploadResult.name,
        });
      }
    }
  }
  await post.save();
  res.status(201).json({ message: "Post updated successfully", post });
});

//!=====================Delete Post===========================================

const deletePost = catchError(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) return next(new AppError(msg.post.notFound, 404));

  if (req.originalUrl.includes("group")) {
    let group = await Group.findById(req.params.groupId);
    if (!group) return next(new AppError(msg.group.notFound, 404));

    if (
      !post.createdBy.equals(req.user._id) ||
      group.admins.includes(req.user._id)
    ) {
      await Group.findByIdAndUpdate(req.params.groupId, {
        $pull: { posts: req.params.id },
      });
    } else return next(new AppError("unauthorized user", 401));
  }

  if (!post.createdBy.equals(req.user._id))
    return next(new AppError("unauthorized user", 401));

  let arr = post.imageId;
  for (let i in arr) {
    await deleteImage(post.imageId[i]);
  }
  await Post.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "Post deleted successfully" });
});

/**
 * recommendations": [
        
{"New Post: cairo\n\nID: 680208aa496222875fb32158 
Tag: cairo 
Text: I went to the Pyramids today and had a great time! I met a boy with black skin there, he was very ki...\n\nID: 680803eda205c536edf69807 | Tag:  | Text: Sonic is here...\n\nID: 682651227b1ee8288453d5ac | Tag: obelisk | Text: clair 33 expedition  verso...\n\nID: 67f92e2e37436e0637235f68 | Tag: pyramid | Text: the pyramids is one world 7 wonders...\n\nID: 67f7f5153e3b5da6fc6654bb | Tag:  | Text: Cleo was the last pharoh in egypt history..."
    ],
 */

export {
  createPost,
  getOnePost,
  addLike,
  rePost,
  getAllPosts,
  updatePost,
  deletePost,
};

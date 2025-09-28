import { model, Schema } from "mongoose";
import { gender, status } from "../../src/utils/constants/enums.js";

const schema = new Schema(
  {
    socketId: String,
    userName: {
      type: String,
      // required: true,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: Object.values(status),
      default: status.PENDING,
    },

    active: {
      type: Boolean,
      default: false,
    },

    followers: [
      {
        type: String,
      },
    ],

    following: [
      {
        type: String,
      },
    ],

    followersCount: Number,

    followingCount: Number,

    location: String,

    bio: String,

    DOB: Date,

    profileImage: {
      type: String,
      default:
        "default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg?updatedAt=1732911869214",
    },

    backGroungImage: {
      type: String,
      default:
        "default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg?updatedAt=1732911869214",
    },

    profileimageId: String,

    backGroungimageId: String,

    otp: { type: String, default: "123" },

    otpExp: Date,

    gender: {
      type: String,
      enum: Object.values(gender),
      default: gender.FEMALE,
    },

    passwordChangedAt: Date,

    logoutAt: Date,
  },

  { timestamps: true, versionKey: false }
);

schema.post("init", (doc) => {
  const baseURL = "https://ik.imagekit.io/papyrus/uploads/users/";
  if (doc.profileImage && !doc.profileImage.startsWith("http")) {
    doc.profileImage = baseURL + doc.profileImage;
  } else if (!doc.profileImage) {
    doc.profileImage = baseURL + "default.jpg";
  }
  if (doc.backGroungImage && !doc.backGroungImage.startsWith("http")) {
    doc.backGroungImage = baseURL + doc.backGroungImage;
  } else if (!doc.backGroungImage) {
    doc.backGroungImage = baseURL + "default.jpg";
  }
});

export const User = model("User", schema);

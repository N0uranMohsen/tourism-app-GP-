import mongoose, { model, Schema } from "mongoose";

const schema = new Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
    recommendations: [
      {
        id: String,
        tag: String,
        text: String,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export const Recommendations = model("Recommendations", schema);

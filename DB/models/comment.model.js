import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // createdAt: Date,
    isEdited: { type: Boolean, default: false },
    description: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    reply: [
      {
       description: { type: String, required: true },
        createdBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: Date,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export const Comment = model("Comment", schema);

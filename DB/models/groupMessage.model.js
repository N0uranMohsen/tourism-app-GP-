import mongoose, { model, Schema } from "mongoose";

const schema = new Schema(
  {
    message: String,
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, versionKey: false }
);
export const GroupMessage = model("GroupMessage", schema);


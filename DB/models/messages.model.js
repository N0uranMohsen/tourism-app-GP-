import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    message: String,
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    
  },
  { timestamps: true, versionKey: false }
);
export const Message = model("Message", schema);

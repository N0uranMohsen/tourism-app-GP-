import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "No description",
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    coverImages: {
      frontImage: String,
      frontImageId: String,
      backgroundImage: String,
      backgroundImageId: String,
    },
  },
  { timestamps: true, versionKey: false }
);
schema.post("init", (doc) => {
  const baseURL = "https://ik.imagekit.io/papyrus/uploads/groups/";
  if (doc.coverImages) {
    if (
      doc.coverImages.frontImage &&
      !doc.coverImages.frontImage.startsWith("http")
    ) {
      doc.coverImages.frontImage = baseURL + doc.coverImages.frontImage;
    } else if (!doc.coverImages.frontImage) {
      doc.coverImages.frontImage = baseURL + "default.jpg";
    }
  }
});
export const Group = model("Group", schema);

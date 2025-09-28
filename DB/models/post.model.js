import { model, Schema } from "mongoose";

const schema = new Schema(
  {
    description: String,
    images: [
      {
        imageId: String,
        image: String,
      },
    ],
    // image: [
    //   {
    //     type: String,
    //   },
    // ],
    // imageId: [
    //   {
    //     type: String,
    //   },
    // ],
    vedio: String,
    repostedFrom: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // createdAt: Date,
    isEdited: { type: Boolean, default: false },
    tag: String,
    likescount: Number,
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        // required: true,
      },
    ],

    mention: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        //required: true,
      },
    ],

    shareCount: Number,
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true } }
);
schema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
});
// schema.pre(/^find/, function () {
//   this.populate("comments");
// });

schema.post("init", (doc) => {
  const baseURL = "https://ik.imagekit.io/papyrus/uploads/posts/";
  if (Array.isArray(doc.images) && doc.images.length > 0) {
    doc.images = doc.images.map((img) =>
      img.image.startsWith("http")
        ? img
        : { ...img, image: baseURL + img.image }
    );
  }
});

export const Post = model("Post", schema);

import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { AppError } from "../utils/appError.js";
import ImageKit from "imagekit";
import Joi from "joi";
import { config } from "dotenv";
config({ path: "./.env" });
export const fileValidation = {
  image: ["image/png", "image/jpg", "image/jpeg", "image/gif"],
};
const fileValidationSchema = {
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  size: Joi.number().optional(),
  buffer: Joi.binary().optional(),
  encoding: Joi.string().required(),
  mimetype: Joi.string().required(),
};

// Initialize ImageKit instance
const imagekit = new ImageKit({
  publicKey: process.env.PUBLICKEY,
  privateKey: process.env.PRIVATEKEY,
  urlEndpoint: process.env.URLENFPOINT,
});

export const fileUpload = ({ allowFile = fileValidation.image }) => {
  const storage = multer.memoryStorage();

  function fileFilter(req, file, cb) {
    // if (!file && isOptional) return cb(null, true);//in posts not nessacry to upload image

    const fileSchema = Joi.object(fileValidationSchema);
    const { error } = fileSchema.validate(file);
    //console.log(error);

    if (error) cb(new AppError("image format not valid", 415), false);
    if (allowFile.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      cb(new AppError("image format not valid", 415), false);
    }
  }
  const upload = multer({ storage, fileFilter });

  return upload;
};

export const uploadSingleFile = (fieldName) => fileUpload().single(fieldName);

// export const uploadMixOfFiles = (arrayoffields, maxcount,allowFile) =>
//   fileUpload(allowFile).fields(arrayoffields, maxcount);

export const uploadToImageKit = (file, folderName) => {
  return new Promise((resolve, reject) => {
    const fileName = uuidv4() + "-" + file.originalname; // Generate a unique name for the file

    // Upload to ImageKit
    imagekit.upload(
      {
        file: file.buffer, // Use `file.buffer` if you are receiving the image file via multer or similar
        fileName: fileName,
        folder: `uploads/${folderName}`,
      },
      (err, result) => {
        if (err) {
          console.error("Error during ImageKit upload:", err);
          return reject(new AppError(err.message, 404));
        } else {
          resolve(result); // Resolve the promise with the result
        }
      }
    );
  });
};

export const deleteImage = async (fileId) => {
  return new Promise((resolve, reject) => {
    imagekit.deleteFile(fileId, (err, result) => {
      if (!fileId || !err) {
        resolve(result);
      } else {
        console.error("ImageKit Delete Error:", err);
        return reject(new AppError(err.message, 404));
      }
    });
  });
};

import joi from "joi";
import { AppError } from "../utils/appError.js";

export const generalFields = {
  name: joi.string(),
  DOB: joi.date(),
  gender: joi.string(),
  bio:joi.string().max(200),
  comment:joi.string().max(1000),
  location:joi.string(),
  objectId: joi.string().hex().length(24).required(),
  password: joi
    .string()
    .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/),
  email: joi.string().email(),
  phone: joi.string().pattern(/^01[0|1|2|5]\d{8}$/),
  image: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi
      .string()
      .valid("image/png", "image/jpg", "image/jpeg", "image/gif")
      .required(),
    size: joi.number().required(),
    buffer: joi.binary().required(),
  }),
};
export const isValid = (schema) => {
  return (req, res, next) => {
    let data = { ...req.body, ...req.params, ...req.query };
    if (req.files)
      data = {  ...req.body, ...req.params, ...req.query };
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      const arrMsg = error.details.map((err) => err.message);

      return next(new AppError(arrMsg, 400));
    }
    next();
  };
};

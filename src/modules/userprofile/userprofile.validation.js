import joi from "joi";
import { generalFields } from "../../middleware/Validation.js";

export const updateVal = joi.object({
  firstName: generalFields.name,
  lastName: generalFields.name,
  userName: generalFields.name,
  email: generalFields.email,
  bio: generalFields.bio,
  location: generalFields.location,
  phone: generalFields.phone,
  password: generalFields.password,
  DOB: generalFields.DOB,
  gender: generalFields.gender,
  image: generalFields.image,
});

export const deleteVal = joi.object({
  password: generalFields.password.required(),
});

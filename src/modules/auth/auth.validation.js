import joi from "joi";
import { generalFields } from "../../middleware/Validation.js";

export const signupVal = joi.object({
  firstName: generalFields.name.required(),
  lastName: generalFields.name.required(),
  // userName:generalFields.name.required(),
  email: generalFields.email.required(),
  phone: generalFields.phone.required(),
  password: generalFields.password.required(),
  DOB: joi.date().required(),
  gender: joi.string().required(),
});

export const otpVal = joi.object({
  email: generalFields.email.required(),
  otp: joi.string().required(),
});

export const signinVal = joi.object({
  email: generalFields.email,
  phone: generalFields.phone,
  password: joi.string().required(),
});
export const resetPasswordVal = joi.object({
  oldPassword: joi.string().required(),
  newPassword: generalFields.password.required(),
});

export const forgetPasswordVal = joi.object({
  email: generalFields.email.required(),
});

export const changePasswordVal = joi.object({
  email: generalFields.email.required(),

  newPassword: generalFields.password.required(),
});

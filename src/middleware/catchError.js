import { AppError } from "../utils/appError.js";

export function catchError(callback) {
  return (req, res, next) => {
    callback(req, res, next).catch((err) => {
      next(new AppError(err.message,err.statusCode));
      //res.json(err)
    });
  };
}

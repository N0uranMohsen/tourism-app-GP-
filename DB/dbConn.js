import mongoose from "mongoose";

export const dbConn = () =>
  mongoose
    .connect(`mongodb+srv://${process.env.DBUSENAME}:${process.env.DBPASS}@cluster0.7g6a7.mongodb.net/pyramedia`)
    .then(() => console.log("db connected sucessfully..."))
    .catch((err) => console.log(err));

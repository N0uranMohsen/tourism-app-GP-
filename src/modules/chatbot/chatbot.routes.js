import { Router } from "express";
import { chatBot } from "./chatbot .controller.js";
import { fileUpload, fileValidation } from "../../middleware/fileUpload.js";

const chatRouter = Router();
chatRouter
  .route("/")
  .post(
    fileUpload({}).fields([
      { name: "image", maxcount: 2, allowFile: fileValidation.image },
    ]),
    chatBot
  );

export default chatRouter;

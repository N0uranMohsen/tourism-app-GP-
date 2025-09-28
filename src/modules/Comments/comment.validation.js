import joi from "joi";
import { generalFields } from "../../middleware/Validation.js";

export const commentVal =joi.object({
    description:generalFields.comment.required(),
    postId:generalFields.objectId
    
})
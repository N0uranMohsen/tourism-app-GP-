import { model, Schema } from "mongoose"

const schema = new Schema({

    reciever:{
        type:Schema.Types.ObjectId,
        ref:"User",
       
    },
    sender:{
        type:Schema.Types.ObjectId,
        ref:"User",
       
    },
    type:{
        type:String,
        enum:['like','comment','message'],

    },
   post:{
        type:Schema.Types.ObjectId,
        ref:"Post",
        //required:true
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    message:String

},{versionKey:false,timestamps:true})
export const Notification = model("Notification", schema);

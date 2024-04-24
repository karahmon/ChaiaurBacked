import mongoose,{Schema} from "mongoose";
const likeSchema = new Schema({
    video:{
        type:String,
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    comment:{
        type:String,
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    tweet:{
        type:String,
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    },
    likedby:{
        type:String,
        type:Schema.Types.ObjectId,
        ref:"User"
    },
},{timestamps:true});

export const Like = mongoose.model("Like",likeSchema);

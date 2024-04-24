import mongoose,{Schema} from "mongoose";


const tweetSchema = new Schema({
    content:{
        type:String,
        required:true
    },
    owner:{
        type:String,
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});

export const Tweet = mongoose.model("Tweer",tweetSchema);

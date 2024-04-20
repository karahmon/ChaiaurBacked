import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User", // one who is subscribing
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User", // one to whom the subscriber is subscribing
    }   
},{timestamps:true})

export default mongoose.model("Subscription",subscriptionSchema)

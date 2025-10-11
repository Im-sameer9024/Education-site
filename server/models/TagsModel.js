import mongoose from "mongoose";






const TagsModel = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    description:{
        type:String,
        trim:true,
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },


})


const Tags = mongoose.model("Tags", TagsModel);

export default Tags;
import mongoose from "mongoose";


const CourseProgressModel = new mongoose.Schema({
    courseId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    completedVideos:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection"
    }],

})



const CourseProgress = mongoose.model("CourseProgress", CourseProgressModel);

export default CourseProgress;
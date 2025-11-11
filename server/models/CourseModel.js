import mongoose from 'mongoose';

const CourseModel = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      unique: true,
    },
    courseDescription: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    whatYouWillLearn: {
      type: String,
    },
    courseContent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
      },
    ],
    ratingAndReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RatingAndReview',
      },
    ],
    price: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
    ],
    instructions:{
      type:[String],
    },
    status:{
      type:String,
      enum:['draft','published','archived'],
    }
  },
  {
    minimize: true,
    timestamps: true,
  }
);

const Course = mongoose.model('Course', CourseModel);

export default Course;

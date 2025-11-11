import mongoose from 'mongoose';

const UserModel = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName:{
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index:true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ['admin', 'student', 'teacher'],
      required: true,
      index:true, // for faster query
    },
    active:{
      type: Boolean,
      default:true
    },
    approved:{
      type: Boolean,
      default:false
    },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    image: {
      type: String,
      required: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseProgress',
      },
    ],
  },
  { minimize: true, timestamps: true }
);


const User = mongoose.model('User', UserModel);
export default User;

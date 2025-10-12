import mongoose from 'mongoose';

const ProfileModel = new mongoose.Schema(
  {
    gender: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    about: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
  },
  {
    minimize: true,
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', ProfileModel);
export default Profile;

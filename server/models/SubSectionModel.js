import mongoose from "mongoose";

const SubSectionModel = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    timeDuration: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    videoUrl: {
      type: String,
    },
  },
  {
    minimize: true,
    timestamps: true,
  }
);

const SubSection = mongoose.model("SubSection", SubSectionModel);

export default SubSection;

import mongoose from "mongoose";

const SectionModel = new mongoose.Schema({
  sectionName: {
    type: String,
    required: true,
    trim: true,
  },
  subSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SubSection",
    },
  ],
});

const Section = mongoose.model("Section", SectionModel);
export default Section;

import mongoose from 'mongoose';

const CategoryModel = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  course: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
  ],
});

const Category = mongoose.model('Category', CategoryModel);

export default Category;

import mongoose from 'mongoose';

const RatingAndReviewModel = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    trim: true,
    required: true,
  },
});

const RatingAndReview = mongoose.model('RatingAndReview', RatingAndReviewModel);

export default RatingAndReview;

import mongoose from 'mongoose';

const RefreshTokenModel = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 24 * 60 * 60, // 7 days
  },
});

RefreshTokenModel.index({ token: 1 }, { unique: true });
RefreshTokenModel.index({ userId: 1 }, { unique: true });

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenModel);
export default RefreshToken;

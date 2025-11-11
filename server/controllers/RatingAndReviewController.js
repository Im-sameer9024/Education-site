import mongoose from 'mongoose';
import Course from '../models/CourseModel';
import RatingAndReview from '../models/RatingAndReviewModel';

const createRatingAndReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, review, courseId } = req.body;

    //---------- check if the user is enrolled in the course ---------

    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $in: [userId] },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: 'Student is not enrolled in this course',
      });
    }

    //---------- check if the user has already rated and reviewed the course ---------

    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'Student has already rated and reviewed the course',
      });
    }

    const ratingReview = await RatingAndReview.create({
      rating: rating,
      review: review,
      course: courseId,
      user: userId,
    });

    await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { ratingAndReviews: ratingReview._id },
      },
      {
        new: true,
      }
    );

    await courseDetails.save();

    res.status(200).json({
      success: true,
      message: 'Rating and review created successfully',
      data: ratingReview,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const getAverageRating = async (req, res) => {
  try {
    const courseId = req.body.courseId;

    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    const averageRating =
      result.length > 0 ? parseFloat(result[0].averageRating.toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      message: 'Average rating fetched successfully',
      averageRating: averageRating,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const getAllRatingAndReviews = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: -1 })
      .populate({
        path: 'user',
        select: 'firstName lastName email image',
      })
      .populate({
        path: 'course',
        select: 'courseName',
      })
      .exec();

    if (!allReviews || allReviews.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No reviews found',
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: 'All reviews fetched successfully',
      data: allReviews,
    });
  } catch (error) {
    console.log('error in all rating and review controller', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export { createRatingAndReview, getAverageRating, getAllRatingAndReviews };

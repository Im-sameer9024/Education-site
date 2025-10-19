import Category from '../models/CategoryModel.js';
import Course from '../models/CourseModel.js';
import User from '../models/UserModel.js';
import uploadImageToCloudinary from '../utils/imageUploader.js';

const createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;

    const { buffer, originalname } = req.file;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category
    ) {
      return res
        .status(400)
        .json({ success: false, message: 'Please fill all the fields' });
    }

    const userId = req.user.id;

    const teacherDetails = await User.findById(userId);

    if (!teacherDetails) {
      return res
        .status(404)
        .json({ success: false, message: 'Teacher is not found' });
    }

    const categoryDetails = await Category.findById(category);

    if (!categoryDetails) {
      return res
        .status(404)
        .json({ success: false, message: 'Category is not found' });
    }

    //---------------upload image to cloudinary---------

    const thumbnailUrl = await uploadImageToCloudinary(
      buffer,
      originalname,
      process.env.FOLDER_NAME
    );

    //--------------create an entry for new Course ---------------

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      category: categoryDetails._id,
      thumbnail: thumbnailUrl.secure_url,
      teacher: teacherDetails._id,
    });

    //------------course add in user teacher----------
    await User.findByIdAndUpdate(
      { _id: teacherDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      {
        new: true,
      }
    );

    //----------------course add in category----------------

    await Category.findByIdAndUpdate(
      { _id: categoryDetails._id },
      {
        $push: {
          course: newCourse._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Course created successfully',
      data: newCourse,
    });
  } catch (error) {
    console.log('Error occur in create course controller', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find(
      {},
      {
        courseName: true,
        courseDescription: true,
        whatYouWillLearn: true,
        price: true,
        thumbnail: true,
        category: true,
        teacher: true,
        ratingAndReviews: true,
      }
    )
      .populate('category')
      .populate('teacher')
      .populate('studentsEnrolled')
      .populate('ratingAndReviews')
      .populate('courseContent')
      .exec();

    return res.status(200).json({
      success: true,
      message: 'Courses fetched successfully',
      data: courses,
    });
  } catch (error) {
    console.log('Error occur in getAllCourses controller', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export { createCourse, getAllCourses };

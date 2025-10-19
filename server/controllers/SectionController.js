import Course from '../models/CourseModel.js';
import Section from '../models/SectionModel.js';

const createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide section name' });
    }

    const newSection = await Section.create({ sectionName });

    //---------------update the Course schema ---------

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: 'Section created successfully',
      data: updatedCourse,
    });
  } catch (error) {
    console.log('Error occur in create Course controller', error);

    return res.status(500).json({
      success: false,
      message: 'Error creating section',
      error: error.message,
    });
  }
};

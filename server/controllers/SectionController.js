import Course from '../models/CourseModel.js';
import Section from '../models/SectionModel.js';
import SubSection from '../models/SubSectionModel.js';

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

const updateSection = async (req, res) => {
  try {
    const { sectionId, sectionName,courseId } = req.body;

    if (!sectionId || !sectionName || !courseId) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide section name' });
    }

    const updateSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        sectionName: sectionName,
      },
      { new: true }
    );

    const course = await Course.findById(courseId).populate({
      path: 'courseContent',
      populate: {
        path: 'subSection',
      }
    }).exec();


    return res.status(200).json({
      success: true,
      message: 'Section updated successfully',
      updatedSection: updateSection,
      data: course,
    });
  } catch (error) {
    console.log('Error occur in update Section controller', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating section',
      error: error.message,
    });
  }
};

const deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body;

    if (!sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'SectionId is required',
      });
    }

    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    });

    const section = await Section.findById(sectionId);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found',
      });
    }

    // Delete the associated subSections

    await SubSection.deleteMany({ _id: { $in: section.subSection } });

    await Section.findByIdAndDelete(sectionId);

    const course = await Course.findById(courseId)
      .populate({
        path: 'courseContent',
        populate: {
          path: 'subSection',
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: 'Section deleted successfully',
      data: course,
    });
  } catch (error) {
    console.log('Error occur in delete Section controller', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting section',
      error: error.message,
    });
  }
};

export default { createSection, updateSection, deleteSection };

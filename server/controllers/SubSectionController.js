import Section from '../models/SectionModel.js';
import SubSection from '../models/SubSectionModel.js';
import uploadImageToCloudinary from '../utils/imageUploader.js';

const createSubSection = async (req, res) => {
  try {
    const { title, timeDuration, description, sectionId } = req.body;

    const video = req.files.videoFile;

    if (!title || !timeDuration || !description || !sectionId || !video) {
      return res
        .status(400)
        .json({ success: false, message: 'Please fill all the fields' });
    }

    const uploadDetails = await uploadImageToCloudinary(
      video.data,
      video.name,
      process.env.FOLDER_NAME
    );

    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    //------------------ update section ---------------

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: { subSections: SubSectionDetails._id },
      },
      { new: true }
    );
  } catch (error) {}
};

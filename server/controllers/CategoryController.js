import Category from '../models/CategoryModel.js';

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//-----------------create Category-----------------------

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const category = await Category.create({
      name: name,
      description: description,
    });

    return res.status(200).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    console.log('Error occur in createCategory controller', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//-----------------get all Categories-----------------------
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find(
      {},
      {
        name: true,
        description: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'All Category fetched successfully',
      data: categories,
    });
  } catch (error) {
    console.log('Error occur in getAllCategories ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//---------------------get Single Category-----------------------

const categoryDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category Id is required',
      });
    }

    const [selectedDetails, categoriesExceptSelected, allCategories] =
      await Promise.all([
        Category.findById(categoryId)
          .populate({
            path: 'course',
            match: {
              status: 'published',
            },
            populate: 'ratingAndReviews',
          })
          .lean()
          .exec(),

        Category.find({
          _id: { $ne: categoryId },
        }),
        Category.find()
          .populate({
            path: 'course',
            match: {
              status: 'published',
            },
          })
          .exec(),
      ]);

    if (!selectedDetails) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (selectedDetails.course.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No course found',
      });
    }

    // other category courses

    const randomCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    );

    const differentCategory = await Category.findOne(randomCategory._id)
      .populate({
        path: 'course',
        match: {
          status: 'published',
        },
      })
      .lean()
      .exec();

    const allCourses = allCategories.flatMap(category => category.course);

    const mostSellingCourses = allCourses
      .sort((a, b) => b.studentsEnrolled.length - a.studentsEnrolled.length)
      .slice(0, 3);

    return res.status(200).json({
      success: true,
      message: 'Category details fetched successfully',
      data: {
        selectedDetails,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    console.log('Error occur in categoryDetails ', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export { createCategory, getAllCategories, categoryDetails };

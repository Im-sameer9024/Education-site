//-----------------create Category-----------------------

import Category from '../models/CategoryModel.js';

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

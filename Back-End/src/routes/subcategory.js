const express = require("express");
const { Category, SubCategory } = require("../models");
const { Op } = require("sequelize");
const { auth, adminAuth, optionalAuth } = require("../middleware/auth");
const { subCategoryValidation } = require("../middleware/validation");

const router = express.Router();

// Get all subcategories with their parent categories
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    const whereCondition = { isActive: true };
    if (categoryId) {
      whereCondition.categoryId = categoryId;
    }

    const subcategories = await SubCategory.findAll({
      where: whereCondition,
      include: [
        {
          model: Category,
          as: "category",
          where: { isActive: true },
        },
      ],
      order: [["sortOrder", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: subcategories,
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get single subcategory by ID with parent category
router.get("/:id", optionalAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const subcategory = await SubCategory.findOne({
      where: { id, isActive: true },
      include: [
        {
          model: Category,
          as: "category",
          where: { isActive: true },
        },
      ],
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    console.error("Error fetching subcategory:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Create a new sub category
router.post("/", auth, adminAuth, subCategoryValidation, async (req, res) => {
  try {
    const { name, image, isActive, sortOrder, categoryId } = req.body;

    // Verify that the parent category exists and is active
    const parentCategory = await Category.findOne({
      where: { id: categoryId, isActive: true }
    });

    if (!parentCategory) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID. Category must exist and be active.",
      });
    }

    // Check if sub category already exists within the same category
    const existingSubCategory = await SubCategory.findOne({
      where: {
        name: name, // Exact match - MySQL is case-insensitive by default
        categoryId: categoryId,
      },
    });

    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        message: "Sub category with this name already exists in this category.",
      });
    }

    const newSubCategory = await SubCategory.create({
      name,
      image,
      isActive,
      sortOrder,
      categoryId,
    });

    // Fetch the created subcategory with its parent category
    const createdSubCategory = await SubCategory.findByPk(newSubCategory.id, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: createdSubCategory,
    });
  } catch (error) {
    console.error("Error creating sub category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update an existing Sub category
router.put("/:id", auth, adminAuth, subCategoryValidation, async (req, res) => {
  const { id } = req.params;
  const { name, image, isActive, sortOrder, categoryId } = req.body;

  try {
    // Find the sub category
    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    // Verify that the parent category exists and is active
    const parentCategory = await Category.findOne({
      where: { id: categoryId, isActive: true }
    });

    if (!parentCategory) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID. Category must exist and be active.",
      });
    }

    // Check if another sub category with the same name exists in the same category
    const existingSubCategory = await SubCategory.findOne({
      where: {
        name: name, // Exact match - MySQL is case-insensitive by default
        categoryId: categoryId,
        id: { [Op.ne]: parseInt(id) }, // Exclude current subcategory
      },
    });

    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        message: "Sub category with this name already exists in this category.",
      });
    }

    // Update sub category fields
    await subCategory.update({
      name,
      image,
      isActive,
      sortOrder,
      categoryId,
    });

    // Fetch updated subcategory with its parent category
    const updatedSubCategory = await SubCategory.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: updatedSubCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Delete a category
router.delete("/:id", auth, adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub category not found",
      });
    }

    // Soft delete the sub category
    subCategory.isActive = false;
    await subCategory.save();

    res.status(200).json({
      success: true,
      message: "Sub category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sub category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
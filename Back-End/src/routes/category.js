const express = require("express");
const { Category, SubCategory } = require("../models");
const { Op } = require("sequelize");
const { auth, adminAuth, optionalAuth } = require("../middleware/auth");
const { categoryValidation } = require("../middleware/validation");

const router = express.Router();

//get all categories with related subcategories
router.get("/", optionalAuth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: SubCategory,
          as: "subCategories",
          where: { isActive: true },
          required: false,
        },
      ],
      where: { isActive: true },
      order: [["sortOrder", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

//get single category by ID with related subcategories
router.get("/:id", optionalAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findOne({
      where: { id, isActive: true },
      include: [
        {
          model: SubCategory,
          as: "subCategories",
          where: { isActive: true },
          required: false,
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Create a new category
router.post("/", auth, adminAuth, categoryValidation, async (req, res) => {
  try {
    const { name, image, isActive, sortOrder } = req.body;

    // Check if category already exists (MySQL LIKE is case-insensitive by default)
    const existingCategory = await Category.findOne({
      where: {
        name: name, // Exact match - MySQL is case-insensitive by default
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists.",
      });
    }

    const newCategory = await Category.create({
      name,
      image,
      isActive,
      sortOrder,
    });

    res.status(201).json({
      success: true,
      data: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update an existing category
router.put("/:id", auth, adminAuth, categoryValidation, async (req, res) => {
  const { id } = req.params;
  const { name, image, isActive, sortOrder } = req.body;

  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Update category fields
    await category.update({
      name,
      image,
      isActive,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      data: category,
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
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Soft delete the category
    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
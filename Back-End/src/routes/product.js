const express = require('express');
const { Op } = require('sequelize');
const { Product, ProductVariety, SubCategory, Category, User } = require('../models');
const { auth, adminAuth } = require('../middleware/auth');
const { productValidation, updateProductValidation, handleMultipleDefaultImages } = require('../middleware/validation');
const router = express.Router();

// get all products after filtering and sorting
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      search,
      category,
      subcategory,
      minPrice,
      maxPrice,
      brand,
      isActive,
      isFeatured,
      inStock
    } = req.query;

    // Build where conditions
    const whereConditions = {};
    const subCategoryWhere = {};
    const categoryWhere = {};

    // Search by product name or description
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"+subCategory)
    // Filter by price range
    if (minPrice || maxPrice) {
      whereConditions.price = {};
      if (minPrice) whereConditions.price[Op.gte] = minPrice;
      if (maxPrice) whereConditions.price[Op.lte] = maxPrice;
    }

    // Filter by brand
    if (brand) {
      whereConditions.brand = { [Op.like]: `%${brand}%` };
    }

    // Filter by active status
    if (isActive !== undefined) {
      whereConditions.isActive = isActive === 'true';
    }

    // Filter by featured status
    if (isFeatured !== undefined) {
      whereConditions.isFeatured = isFeatured === 'true';
    }

    // Filter by category
    if (category) {
      categoryWhere.id = category;
    }

    // Filter by subcategory
    if (subcategory) {
      subCategoryWhere.id = subcategory;
    }

    // Calculate offset for pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Valid sort fields
    const validSortFields = ['name', 'price', 'createdAt', 'ratingAverage', 'brand'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const queryOptions = {
      where: whereConditions,
      include: [
        {
          model: ProductVariety,
          as: 'varieties',
          required: false
        },
        {
          model: SubCategory,
          as: 'subCategory',
          where: Object.keys(subCategoryWhere).length > 0 ? subCategoryWhere : undefined,
          include: [
            {
              model: Category,
              as: 'category',
              where: Object.keys(categoryWhere).length > 0 ? categoryWhere : undefined
            }
          ]
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [[sortField, order]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    };

    const { count, rows: products } = await Product.findAndCountAll(queryOptions);

    // Filter by stock if requested
    let filteredProducts = products;
    if (inStock === 'true') {
      filteredProducts = products.filter(product => {
        return product.varieties && product.varieties.some(variety => variety.stock > 0);
      });
    }

    // Calculate additional fields for each product
    const enrichedProducts = filteredProducts.map(product => {
      const productData = product.toJSON();
      return {
        ...productData,
        discountPercentage: product.getDiscountPercentage(),
        isAvailable: product.getIsAvailable(),
        totalStock: product.getTotalStock()
      };
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.json({
      success: true,
      data: {
        products: enrichedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPreviousPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductVariety,
          as: 'varieties'
        },
        {
          model: SubCategory,
          as: 'subCategory',
          include: [
            {
              model: Category,
              as: 'category'
            }
          ]
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Enrich product data
    const productData = product.toJSON();
    const enrichedProduct = {
      ...productData,
      discountPercentage: product.getDiscountPercentage(),
      isAvailable: product.getIsAvailable(),
      totalStock: product.getTotalStock()
    };

    res.json({
      success: true,
      data: enrichedProduct
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.post('/', auth, adminAuth, productValidation, handleMultipleDefaultImages, async (req, res) => {
  const transaction = await Product.sequelize.transaction();

  try {
    const {
      name,
      description,
      price,
      originalPrice,
      subCategoryId,
      brand,
      sku,
      images,
      tags,
      weight,
      warranty,
      isFeatured,
      varieties
    } = req.body;

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ where: { sku } });
    if (existingProduct) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    // Verify subcategory exists and is active
    const subCategory = await SubCategory.findOne({
      where: { id: subCategoryId, isActive: true },
      include: [
        {
          model: Category,
          as: 'category',
          where: { isActive: true }
        }
      ]
    });
    
    if (!subCategory) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid subcategory ID. Subcategory must exist, be active, and belong to an active category.'
      });
    }

    // Create the product
    const product = await Product.create({
      name,
      description,
      price,
      originalPrice,
      subCategoryId,
      brand,
      sku,
      images,
      tags,
      weight,
      warranty,
      isFeatured,
      createdById: req.user.id
    }, { transaction });

    // Create product varieties
    if (varieties && varieties.length > 0) {
      const varietyData = varieties.map(variety => ({
        ...variety,
        productId: product.id
      }));

      await ProductVariety.bulkCreate(varietyData, { transaction });
    }

    await transaction.commit();

    // Fetch the created product with all associations
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: ProductVariety,
          as: 'varieties'
        },
        {
          model: SubCategory,
          as: 'subCategory',
          include: [{ model: Category, as: 'category' }]
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: createdProduct
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create product error:', error);

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


router.put('/:id', auth, adminAuth, updateProductValidation, handleMultipleDefaultImages, async (req, res) => {
  const transaction = await Product.sequelize.transaction();

  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      description,
      price,
      originalPrice,
      subCategoryId,
      brand,
      sku,
      images,
      tags,
      weight,
      warranty,
      isFeatured,
      isActive,
      varieties
    } = req.body;

    // Check if SKU is being updated and if it already exists
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ where: { sku } });
      if (existingProduct) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    // Verify subcategory exists if being updated
    if (subCategoryId) {
      const subCategory = await SubCategory.findOne({
        where: { id: subCategoryId, isActive: true },
        include: [
          {
            model: Category,
            as: 'category',
            where: { isActive: true }
          }
        ]
      });
      
      if (!subCategory) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid subcategory ID. Subcategory must exist, be active, and belong to an active category.'
        });
      }
    }

    // Update product fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice;
    if (subCategoryId !== undefined) updateData.subCategoryId = subCategoryId;
    if (brand !== undefined) updateData.brand = brand;
    if (sku !== undefined) updateData.sku = sku;
    if (images !== undefined) updateData.images = images;
    if (tags !== undefined) updateData.tags = tags;
    if (weight !== undefined) updateData.weight = weight;
    if (warranty !== undefined) updateData.warranty = warranty;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isActive !== undefined) updateData.isActive = isActive;

    await product.update(updateData, { transaction });

    // Update varieties if provided
    if (varieties) {
      // Delete existing varieties
      await ProductVariety.destroy({
        where: { productId: product.id },
        transaction
      });

      // Create new varieties
      if (varieties.length > 0) {
        const varietyData = varieties.map(variety => ({
          ...variety,
          productId: product.id
        }));

        await ProductVariety.bulkCreate(varietyData, { transaction });
      }
    }

    await transaction.commit();

    // Fetch the updated product with all associations
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: ProductVariety,
          as: 'varieties'
        },
        {
          model: SubCategory,
          as: 'subCategory',
          include: [{ model: Category, as: 'category' }]
        },
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Update product error:', error);

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (soft delete by setting isActive to false)
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete by setting isActive to false
    await product.update({ isActive: false });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/products/:id/permanent
 * @desc    Permanently delete a product
 * @access  Private (Admin only)
 */
router.delete('/:id/permanent', auth, adminAuth, async (req, res) => {
  const transaction = await Product.sequelize.transaction();

  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product varieties first (due to foreign key constraint)
    await ProductVariety.destroy({
      where: { productId: product.id },
      transaction
    });

    // Delete the product
    await product.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Product permanently deleted'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Permanent delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to permanently delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PATCH /api/products/:id/toggle-active
 * @desc    Toggle product active status
 * @access  Private (Admin only)
 */
router.patch('/:id/toggle-active', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.update({ isActive: !product.isActive });

    res.json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: product.isActive }
    });

  } catch (error) {
    console.error('Toggle product active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle product status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PATCH /api/products/:id/toggle-featured
 * @desc    Toggle product featured status
 * @access  Private (Admin only)
 */
router.patch('/:id/toggle-featured', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.update({ isFeatured: !product.isFeatured });

    res.json({
      success: true,
      message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: { isFeatured: product.isFeatured }
    });

  } catch (error) {
    console.error('Toggle product featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle product featured status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured/all', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.findAll({
      where: {
        isFeatured: true,
        isActive: true
      },
      include: [
        {
          model: ProductVariety,
          as: 'varieties'
        },
        {
          model: SubCategory,
          as: 'subCategory',
          include: [{ model: Category, as: 'category' }]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    // Enrich products with calculated fields
    const enrichedProducts = products.map(product => {
      const productData = product.toJSON();
      return {
        ...productData,
        discountPercentage: product.getDiscountPercentage(),
        isAvailable: product.getIsAvailable(),
        totalStock: product.getTotalStock()
      };
    });

    res.json({
      success: true,
      data: enrichedProducts
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Update product variety stock
 * @access  Private (Admin only)
 */
router.patch('/:id/stock', auth, adminAuth, async (req, res) => {
  try {
    const { varietyId, quantity } = req.body;

    if (!varietyId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Variety ID and quantity are required'
      });
    }

    const product = await Product.findByPk(req.params.id, {
      include: [{ model: ProductVariety, as: 'varieties' }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedVariety = await product.updateStock(varietyId, quantity);

    if (!updatedVariety) {
      return res.status(404).json({
        success: false,
        message: 'Product variety not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        varietyId: updatedVariety.id,
        newStock: updatedVariety.stock
      }
    });

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/products/search/suggestions
 * @desc    Get product search suggestions
 * @access  Public
 */
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { brand: { [Op.like]: `%${q}%` } }
        ],
        isActive: true
      },
      attributes: ['id', 'name', 'brand'],
      limit: parseInt(limit),
      order: [['name', 'ASC']]
    });

    const suggestions = products.map(product => ({
      id: product.id,
      name: product.name,
      brand: product.brand
    }));

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

const handleMultipleDefaultImages = (req, res, next) => {
  if (req.body.images && req.body.images.length > 0) {
    let primaryCount = 0;
    req.body.images.forEach(image => {
      if (image.isPrimary) primaryCount++;
    });

    if (primaryCount > 1) {
      return res.status(400).json({
        success: false,
        message: 'Multiple primary images are not allowed',
      });
    }
  }
  next();
};

const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors,
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors,
];

const productValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Product name must be between 2 and 200 characters'),

    body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),

    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
  
  body('subCategory')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sub-category must be a valid ID'),

    body('sku')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('SKU must be between 2 and 50 characters'),

    body('varieties')
        .isArray({ min: 1 })
        .withMessage('At least one variety is required'),

    body('varieties.*.name')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Variety name is required'),

    body('varieties.*.stock')
        .isInt({ min: 0 })
        .withMessage('Variety stock must be a non-negative integer'),

    body('varieties.*.preorderLevel')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Preorder level must be a non-negative integer'),

    body('originalPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Original price must be a positive number'),

    body('brand')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Brand name cannot exceed 100 characters'),

    body('weight')
        .isFloat({ min: 0 })
        .withMessage('Weight must be a positive number'),

    body('warranty')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Warranty information cannot exceed 100 characters'),

    body('images')
        .isArray({ min: 1 })
        .withMessage('Images must be a non-empty array'),

    body('images.*.url')
        .isURL()
        .withMessage('Image URL must be valid'),

    body('images.*.type')
        .equals('image')
        .withMessage('Only images are accepted'),

    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),

    body('dimensions.length')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Length must be a positive number'),

    body('dimensions.width')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Width must be a positive number'),

    body('dimensions.height')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Height must be a positive number'),

    body('dimensions.weight')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Dimensions weight must be a positive number'),

    handleValidationErrors,
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category must be a valid ID'),
  
  body('subCategory')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sub-category must be a valid ID'),
  
  body('varieties')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one variety is required when provided'),
  
  body('varieties.*.name')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Variety name is required'),
  
  body('varieties.*.stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Variety stock must be a non-negative integer'),
  
  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  
  body('warranty')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Warranty information cannot exceed 100 characters'),
  
  handleValidationErrors,
];

const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  
  body('image')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  handleValidationErrors,
];

const subCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Sub-Category name must be between 2 and 100 characters'),
  
  body('image')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
  
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid ID'),
  
  handleValidationErrors,
];



module.exports = {
  registerValidation,
  loginValidation,
  productValidation,
  categoryValidation,
  subCategoryValidation,
  updateProductValidation,
  handleMultipleDefaultImages,
};
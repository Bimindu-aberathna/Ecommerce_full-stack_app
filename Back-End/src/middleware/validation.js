const { body, validationResult } = require('express-validator');
const parseFormDataJSON = (req, res, next) => {
  // Parse varieties if it's a JSON string
  if (req.body.varieties && typeof req.body.varieties === 'string') {
    try {
      req.body.varieties = JSON.parse(req.body.varieties);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid varieties JSON format'
      });
    }
  }

  // Parse tags if it's a JSON string
  if (req.body.tags && typeof req.body.tags === 'string') {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tags JSON format'
      });
    }
  }

  // Parse images if it's a JSON string
  if (req.body.images && typeof req.body.images === 'string') {
    try {
      req.body.images = JSON.parse(req.body.images);
    } catch (e) {
      // Keep as is if not valid JSON
    }
  }

  next();
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      validationError: true,
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

const userUpdateValidation = [
  body('firstName')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // Skip if empty
      if (value.trim().length < 2 || value.trim().length > 50) {
        throw new Error('First name must be between 2 and 50 characters');
      }
      return true;
    }),
  
  body('lastName')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      if (value.trim().length < 2 || value.trim().length > 50) {
        throw new Error('Last name must be between 2 and 50 characters');
      }
      return true;
    }),
  
  body('email')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Please provide a valid email address');
      }
      return true;
    }),

  body('phone')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // ✅ Skip validation for empty strings
      const phoneRegex = /^(?:\+94|94|0)?7[0125678]\d{7}$/;
      if (!phoneRegex.test(value.trim())) {
        throw new Error('Please provide a valid phone number');
      }
      return true;
    }),

  body('postalCode')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // ✅ Skip validation for empty strings
      const postalRegex = /^\d{5}$/;
      if (!postalRegex.test(value.trim())) {
        throw new Error('Enter a valid postal code');
      }
      return true;
    }),

  body('address')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      if (value.trim().length < 5 || value.trim().length > 256) {
        throw new Error('Address must be between 5 and 256 characters');
      }
      return true;
    }),

  // Avatar validation stays the same
  body('avatar')
    .optional()
    .custom((value, { req }) => {
      if (!req.file && !value) {
        return true;
      }
      
      const file = req.file;
      if (file) {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimes.includes(file.mimetype)) {
          throw new Error('Only .jpg, .jpeg, .png, .gif, .webp files are allowed');
        }
        
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error('File size cannot exceed 5MB');
        }
      }
      
      return true;
    }),

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
    parseFormDataJSON, // Add this first!
    
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

    body('subCategoryId')
        .isInt({ min: 1 })
        .withMessage('Sub-category ID must be a valid ID'),

    body('sku')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('SKU must be between 2 and 50 characters'),

    body('varieties')
        .custom((value) => {
          // Check if files exist OR if varieties array is provided
          if (!value || (Array.isArray(value) && value.length === 0)) {
            throw new Error('At least one variety is required');
          }
          if (!Array.isArray(value)) {
            throw new Error('Varieties must be an array');
          }
          return true;
        }),

    body('varieties.*.name')
        .optional()
        .trim()
        .isLength({ min: 1 })
        .withMessage('Variety name is required'),

    body('varieties.*.stock')
        .optional()
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
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Weight must be a positive number'),

    body('warranty')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Warranty information cannot exceed 100 characters'),

    body('tags')
        .optional()
        .custom((value) => {
          if (value && !Array.isArray(value)) {
            throw new Error('Tags must be an array');
          }
          return true;
        }),

    body('isFeatured')
        .optional()
        .isBoolean()
        .withMessage('isFeatured must be a boolean'),

    handleValidationErrors,
];

const updateProductValidation = [
  parseFormDataJSON, // Add this first!
  
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

  body('tags')
    .optional()
    .custom((value) => {
      if (value && !Array.isArray(value)) {
        throw new Error('Tags must be an array');
      }
      return true;
    }),
  
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
  userUpdateValidation,
  parseFormDataJSON,
};
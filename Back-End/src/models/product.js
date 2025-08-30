const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Product name is required'
      },
      len: {
        args: [1, 200],
        msg: 'Product name cannot exceed 200 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Product description is required'
      },
      len: {
        args: [1, 2000],
        msg: 'Description cannot exceed 2000 characters'
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Price cannot be negative'
      }
    }
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Original price cannot be negative'
      }
    }
  },
  subCategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sub_categories',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'SKU already exists'
    },
    validate: {
      notEmpty: {
        msg: 'SKU is required'
      }
    },
    set(value) {
      this.setDataValue('sku', value.toUpperCase());
    }
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  ratingAverage: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  weight: {
    type: DataTypes.DECIMAL(8, 3),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Weight cannot be negative'
      }
    }
  },
  warranty: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdById: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    {
      name: 'idx_product_name',
      fields: ['name']
    },
    {
      name: 'idx_product_subcategory_id',
      fields: ['subCategoryId']
    },
    {
      name: 'idx_product_price',
      fields: ['price']
    },
    {
      name: 'idx_product_sku',
      unique: true,
      fields: ['sku']
    },
    {
      name: 'idx_product_brand',
      fields: ['brand']
    }, 
    {
      name: 'idx_product_active',
      fields: ['isActive']
    },
    {
      name: 'idx_product_featured',
      fields: ['isFeatured']
    },
    {
      name: 'idx_product_created_by',
      fields: ['createdById']
    },
    {
      name: 'idx_product_created_at',
      fields: ['createdAt']
    },
    {
      name: 'idx_product_active_subcategory',
      fields: ['isActive', 'subCategoryId']
    }
  ]
});

// Variety model for product variants
const ProductVariety = sequelize.define('ProductVariety', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Variety name is required'
      }
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Stock cannot be negative'
      }
    }
  },
  preorderLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Preorder level cannot be negative'
      }
    }
  },
  ignoreWarnings: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'product_varieties',
  timestamps: true,
  indexes: [
    {
      name: 'idx_variety_product_id',
      fields: ['productId']
    },
    {
      name: 'idx_variety_name_product',
      unique: true,
      fields: ['name', 'productId']
    },
    {
      name: 'idx_variety_stock',
      fields: ['stock']
    }
  ]
});

// Virtual fields using getters
Product.prototype.getDiscountPercentage = function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
};

Product.prototype.getIsAvailable = function() {
  return this.isActive && this.varieties && this.varieties.some(v => v.stock > 0);
};

Product.prototype.getTotalStock = function() {
  if (!this.varieties) return 0;
  return this.varieties.reduce((total, variety) => total + variety.stock, 0);
};

// Instance methods
Product.prototype.updateStock = async function(varietyId, quantity) {
  const variety = await ProductVariety.findOne({
    where: { id: varietyId, productId: this.id }
  });
  
  if (variety) {
    variety.stock = Math.max(0, variety.stock + quantity);
    await variety.save();
  }
  
  return variety;
};

Product.prototype.isInStock = function(quantity = 1) {
  const totalStock = this.getTotalStock();
  return totalStock >= quantity;
};

// Hook to handle primary image logic
Product.beforeSave(async (product) => {
  if (product.changed('images') && product.images && product.images.length > 0) {
    let primaryCount = 0;
    product.images.forEach(image => {
      if (image.isPrimary) primaryCount++;
    });
    
    if (primaryCount === 0) {
      product.images[0].isPrimary = true;
    } else if (primaryCount > 1) {
      let foundPrimary = false;
      product.images.forEach(image => {
        if (image.isPrimary && !foundPrimary) {
          foundPrimary = true;
        } else {
          image.isPrimary = false;
        }
      });
    }
  }
});

module.exports = { Product, ProductVariety };
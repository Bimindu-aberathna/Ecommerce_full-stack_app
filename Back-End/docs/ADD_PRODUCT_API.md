# Add Product API Documentation

## Overview
The Add Product API allows administrators to create new products in the Champion Server system. This endpoint supports comprehensive product information including varieties, images, dimensions, and metadata.

## Endpoint
```
POST /api/products
```

## Authentication
- **Required**: Yes
- **Type**: Bearer Token
- **Role**: Admin only

## Headers
```
Content-Type: application/json
Authorization: Bearer {your_auth_token}
```

## Request Body Schema

### Required Fields
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `name` | String | Product name | 2-200 characters |
| `description` | String | Product description | 10-2000 characters |
| `price` | Number | Product price | Must be positive |
| `category` | Integer | Category ID | Valid positive integer |
| `sku` | String | Stock Keeping Unit | 2-50 characters, unique |
| `weight` | Number | Product weight (kg) | Must be positive |
| `varieties` | Array | Product varieties | At least one variety required |

### Optional Fields
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `originalPrice` | Number | Original price for discounts | Must be positive |
| `subCategory` | Integer | Sub-category ID | Valid positive integer |
| `brand` | String | Brand name | Max 100 characters |
| `warranty` | String | Warranty information | Max 100 characters |
| `images` | Array | Product images | Array of image objects |
| `dimensions` | Object | Product dimensions | Length, width, height, weight |
| `tags` | Array | Product tags | Array of strings |
| `isFeatured` | Boolean | Featured product flag | Default: false |

### Varieties Schema
Each variety in the `varieties` array must include:
```json
{
  "name": "String (required)",
  "stock": "Number (required, min: 0)",
  "preorderLevel": "Number (optional, min: 0, default: 0)",
  "ignoreWarnings": "Boolean (optional, default: false)"
}
```

### Images Schema
Each image in the `images` array can include:
```json
{
  "url": "String (required, valid URL)",
  "alt": "String (optional)",
  "isPrimary": "Boolean (optional, default: false)"
}
```

### Dimensions Schema
```json
{
  "length": "Number (optional, positive)",
  "width": "Number (optional, positive)",
  "height": "Number (optional, positive)",
  "weight": "Number (optional, positive)"
}
```

## Example Requests

### Minimal Working Example
Here's the simplest possible product request that will pass validation:

```json
{
  "name": "Test Product",
  "description": "This is a test product with minimal required fields",
  "price": 29.99,
  "category": "60d5ec49f1b2c8b1f8e4a1b1",
  "sku": "TEST-001",
  "weight": 0.5,
  "varieties": [
    {
      "name": "Default",
      "stock": 10
    }
  ]
}
```

**Important Notes for the Minimal Example:**
- Replace `"60d5ec49f1b2c8b1f8e4a1b1"` with an actual category ObjectId from your database
- The SKU must be unique across all products
- At least one variety is required
- Weight must be a positive number

### Complex Product Example (MacBook Pro)
```json
{
  "name": "MacBook Pro 16-inch M2 Pro",
  "description": "Apple MacBook Pro 16-inch with M2 Pro chip, featuring incredible performance and all-day battery life for professional workflows. Perfect for developers, designers, and content creators.",
  "price": 2499.99,
  "originalPrice": 2799.99,
  "category": 1,
  "subCategory": 2,
  "brand": "Apple",
  "sku": "MBP16-M2PRO-512",
  "weight": 2.15,
  "warranty": "1 year limited warranty",
  "varieties": [
    {
      "name": "Space Gray - 512GB",
      "stock": 25,
      "preorderLevel": 5,
      "ignoreWarnings": false
    },
    {
      "name": "Silver - 512GB",
      "stock": 20,
      "preorderLevel": 5,
      "ignoreWarnings": false
    },
    {
      "name": "Space Gray - 1TB",
      "stock": 15,
      "preorderLevel": 3,
      "ignoreWarnings": false
    }
  ],
  "images": [
    {
      "url": "https://example.com/macbook-pro-16-main.jpg",
      "alt": "MacBook Pro 16-inch main view",
      "isPrimary": true
    },
    {
      "url": "https://example.com/macbook-pro-16-side.jpg",
      "alt": "MacBook Pro 16-inch side view",
      "isPrimary": false
    },
    {
      "url": "https://example.com/macbook-pro-16-keyboard.jpg",
      "alt": "MacBook Pro 16-inch keyboard view",
      "isPrimary": false
    }
  ],
  "dimensions": {
    "length": 35.57,
    "width": 24.81,
    "height": 1.68,
    "weight": 2.15
  },
  "tags": ["laptop", "apple", "professional", "m2", "macbook", "16-inch", "developer"],
  "isFeatured": true
}
```

### Simple Product Example (Gaming Mouse)
```json
{
  "name": "Wireless Gaming Mouse",
  "description": "High-precision wireless gaming mouse with RGB lighting and customizable buttons for professional gaming.",
  "price": 79.99,
  "originalPrice": 99.99,
  "category": 3,
  "brand": "TechGear",
  "sku": "WGM-RGB-001",
  "weight": 0.095,
  "warranty": "2 years manufacturer warranty",
  "varieties": [
    {
      "name": "Black",
      "stock": 150,
      "preorderLevel": 20,
      "ignoreWarnings": false
    },
    {
      "name": "White",
      "stock": 100,
      "preorderLevel": 15,
      "ignoreWarnings": false
    }
  ],
  "images": [
    {
      "url": "https://example.com/gaming-mouse-main.jpg",
      "alt": "Wireless Gaming Mouse - Main View",
      "isPrimary": true
    },
    {
      "url": "https://example.com/gaming-mouse-rgb.jpg",
      "alt": "Gaming Mouse with RGB Lighting",
      "isPrimary": false
    }
  ],
  "dimensions": {
    "length": 12.8,
    "width": 6.8,
    "height": 4.3,
    "weight": 0.095
  },
  "tags": ["gaming", "mouse", "wireless", "rgb", "precision"],
  "isFeatured": false
}
```

## Response Format

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "65a1b2c3d4e5f6789abcdef3",
      "name": "MacBook Pro 16-inch M2 Pro",
      "description": "Apple MacBook Pro 16-inch with M2 Pro chip...",
      "price": 2499.99,
      "originalPrice": 2799.99,
      "category": {
        "_id": "65a1b2c3d4e5f6789abcdef0",
        "name": "Electronics"
      },
      "sku": "MBP16-M2PRO-512",
      "varieties": [...],
      "images": [...],
      "rating": {
        "average": 0,
        "count": 0
      },
      "isActive": true,
      "isFeatured": true,
      "createdBy": {
        "_id": "65a1b2c3d4e5f6789abcdef4",
        "firstName": "Admin",
        "lastName": "User"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "discountPercentage": 11,
      "isAvailable": true
    }
  }
}
```

### Error Responses

#### Validation Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Product name must be between 2 and 200 characters",
      "path": "name",
      "location": "body"
    }
  ]
}
```

#### Unauthorized (401 Unauthorized)
```json
{
  "success": false,
  "message": "Access denied. Token not provided."
}
```

#### Forbidden (403 Forbidden)
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

#### Duplicate SKU (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Failed to create product",
  "error": "E11000 duplicate key error collection: champion.products index: sku_1 dup key: { sku: \"MBP16-M2PRO-512\" }"
}
```

## Important Notes

1. **SKU Uniqueness**: The SKU field must be unique across all products. The system will automatically convert it to uppercase.

2. **Primary Image**: If multiple images are provided with `isPrimary: true`, only the first one will remain as primary. If no primary image is specified, the first image will automatically be set as primary.

3. **Category References**: Both `category` and `subCategory` must be valid MongoDB ObjectIds that reference existing Category documents.

4. **Automatic Fields**: The following fields are automatically set by the system:
   - `createdBy`: Set to the authenticated admin user's ID
   - `isActive`: Default true
   - `createdAt` and `updatedAt`: Timestamps

5. **Virtual Fields**: The response includes computed virtual fields:
   - `discountPercentage`: Calculated from original price and current price
   - `isAvailable`: Based on `isActive` status and stock levels

6. **Stock Management**: Stock is now managed at the variety level, not at the product level. Each variety can have its own stock count and preorder level.

## Testing with Postman

The API includes comprehensive Postman collection examples. Import the `Champion-Server-API.postman_collection.json` file and use the following requests:

1. **Create Product (Admin)** - Complex product example
2. **Create Simple Product (Admin)** - Simple product example

Make sure to:
1. Set up environment variables for `base_url` and `auth_token`
2. Authenticate first using the login endpoint to get an admin token
3. Replace example category ObjectIds with actual category IDs from your database

## Rate Limiting
Standard API rate limiting applies. For bulk product creation, consider implementing batch processing or spacing out requests.

## Troubleshooting Common Validation Errors

### 1. "Category must be a valid ID"
**Problem**: You're using an invalid category ID
```json
// ❌ Wrong - using string or invalid number
"category": "electronics"
"category": 0
"category": -1

// ✅ Correct - using positive integer
"category": 1
```

**Solution**: 
- Use a valid positive integer that exists in your categories table
- Get category IDs from `GET /api/categories` endpoint
- Example valid ID: `1`, `2`, `3`, etc.

### 2. "At least one variety is required"
**Problem**: Missing or empty varieties array
```json
// ❌ Wrong - missing varieties
{
  "name": "Product Name",
  "price": 29.99
  // missing varieties
}

// ✅ Correct - with varieties
{
  "name": "Product Name",
  "price": 29.99,
  "varieties": [
    {
      "name": "Default",
      "stock": 10
    }
  ]
}
```

### 3. "Weight must be a positive number"
**Problem**: Missing weight field or invalid value
```json
// ❌ Wrong - missing weight
{
  "name": "Product Name"
  // missing weight
}

// ❌ Wrong - negative weight
"weight": -1.5

// ✅ Correct - positive weight
"weight": 1.5
```

### 4. Common ID Format Issues
- Must be a positive integer (1, 2, 3, etc.)
- Cannot be 0 or negative
- Must reference an existing category in the database

### 5. Getting Valid Category IDs
To get valid category IDs for your requests:

```bash
# GET request to fetch categories
GET /api/categories

# Response example:
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Electronics"
      },
      {
        "id": 2, 
        "name": "Clothing"
      }
    ]
  }
}
```

Use the `id` values from this response in your product creation requests.

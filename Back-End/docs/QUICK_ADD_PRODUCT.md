# Quick Add Product Request Template

## Copy-Paste Ready Request

Replace the placeholder values with your actual data:

```json
{
  "name": "YOUR_PRODUCT_NAME",
  "description": "YOUR_PRODUCT_DESCRIPTION (min 10 characters)",
  "price": 0.00,
  "category": 1,
  "sku": "YOUR_UNIQUE_SKU",
  "weight": 0.0,
  "varieties": [
    {
      "name": "Default",
      "stock": 0
    }
  ]
}
```

## Pre-Steps Checklist

Before creating a product, make sure you have:

1. **Valid Category ObjectId**
   ```bash
   GET /api/categories
   # Copy the _id from response
   ```

2. **Admin Authentication Token**
   ```bash
   POST /api/auth/login
   # Use the token in Authorization header
   ```

3. **Unique SKU**
   - Check existing products to avoid duplicates
   - SKU will be converted to uppercase automatically

## Quick Test Request

```json
{
  "name": "Test Product Quick",
  "description": "Quick test product for validation",
  "price": 19.99,
  "category": 1,
  "sku": "QUICK-TEST-001",
  "weight": 0.1,
  "varieties": [
    {
      "name": "Test Variety",
      "stock": 5
    }
  ]
}
```

**Remember**: Replace `60d5ec49f1b2c8b1f8e4a1b1` with an actual category ID from your database!

## Headers Required

```
Content-Type: application/json
Authorization: Bearer YOUR_ADMIN_TOKEN
```

## Common Validation Fixes

| Error | Fix |
|-------|-----|
| "Category must be a valid ObjectId" | Use 24-character hex string, not category name |
| "At least one variety is required" | Add varieties array with at least one object |
| "Weight must be a positive number" | Add positive weight value (e.g., 0.1) |
| "SKU is required" | Add unique SKU string |
| "Product name must be between 2 and 200 characters" | Check name length |
| "Description must be between 10 and 2000 characters" | Ensure description is at least 10 chars |

# Project Review Report (Backend)

Date: 2026-05-27
Scope: Backend codebase review for interview readiness (errors, unnecessary/repetitive code, missing improvements, and next steps).

## 1) High-impact errors and runtime bugs

- User admin endpoints are using Mongoose-style APIs with Sequelize models, which will throw at runtime (e.g., `findById`, `countDocuments`, `$regex`). Fix by rewriting the admin user routes to Sequelize queries. See [src/routes/users.js](src/routes/users.js).
- Product `top-featured` route references `subCategoryWhere` and `categoryWhere` that are not defined in that scope, which will crash when the code path runs. See [src/routes/product.js](src/routes/product.js).
- Product update uses `updateData.images = req.body` instead of `req.body.images`, which overwrites `images` with the full body and can corrupt data. See [src/routes/product.js](src/routes/product.js).
- Product model `beforeSave` assumes image objects with `isPrimary`, but product creation stores image URLs as strings. Setting `product.images[0].isPrimary = true` will throw on string values. Align images to a single schema (objects or strings) and update validators/hooks. See [src/models/product.js](src/models/product.js) and [src/routes/product.js](src/routes/product.js).
- Password reset/profile update logic writes fields that do not exist in the User model (`addressNumber`, `addressStreet`, etc.). This update will be silently ignored or break validations. See [src/routes/auth.js](src/routes/auth.js) and [src/models/user.js](src/models/user.js).
- Stripe webhook is mounted after `express.json()` in app startup. The raw body requirement will not work in this setup. Webhooks will fail signature validation. Fix by mounting the webhook route before JSON body parsing or by moving it to a dedicated route with raw body. See [src/app.js](src/app.js) and [src/routes/payments.js](src/routes/payments.js).

## 2) Data integrity and logic issues

- `/api/users` admin list uses MongoDB query syntax, so filtering and pagination are incorrect for Sequelize. Rebuild using `where`, `Op.like`, `limit`, `offset`, and `order`. See [src/routes/users.js](src/routes/users.js).
- `registerValidation` does not validate `phone` or `postalCode`, but those fields are required in the User model. This causes Sequelize validation errors on registration. Fix validation or relax model requirements. See [src/middleware/validation.js](src/middleware/validation.js) and [src/models/user.js](src/models/user.js).
- `updateProductValidation` validates `category` and `subCategory`, but the model uses `subCategoryId`. This mismatch causes false validation errors. Align fields. See [src/middleware/validation.js](src/middleware/validation.js).
- Payment creation ignores the client amount and forces a hardcoded test amount. This will cause real payments to be wrong. See [src/routes/payments.js](src/routes/payments.js).
- Payment metadata is stored as a JSON string even though the model column is JSON. Store objects consistently to avoid extra parsing errors. See [src/routes/payments.js](src/routes/payments.js) and [src/models/payment.js](src/models/payment.js).
- Cart item deletion uses `destroy` with `include`, which Sequelize does not enforce for ownership checks. Replace with a `findOne` + `destroy` pattern to ensure authorization. See [src/routes/cart.js](src/routes/cart.js).
- Product list pagination returns `count` from the unfiltered result set even when `inStock` filters the list in memory, causing wrong `totalItems` and `totalPages`. Either filter in SQL or recompute count. See [src/routes/product.js](src/routes/product.js).

## 3) Security and production readiness issues

- Firebase client config (API keys) and service account key appear inside the repo. These should not be committed. Move to env-based config and add to `.gitignore`. See [src/config/Firebase_cofig.js](src/config/Firebase_cofig.js) and [secrets/serviceAccountKey.json](secrets/serviceAccountKey.json).
- `test_route` middleware is enabled on auth routes and logs request data; it also reads `res.body` instead of `req.body`. Remove in production. See [src/Services/testing_purposes.js](src/Services/testing_purposes.js) and [src/app.js](src/app.js).
- `bcrypt.compareSync` is used during login. This blocks the event loop under load. Use async `await bcrypt.compare()` instead. See [src/routes/auth.js](src/routes/auth.js).
- Error handler still contains Mongoose-specific cases (`CastError`, `ValidationError`, duplicate key codes). Replace with Sequelize error handling and standard error shapes. See [src/middleware/errorHandler.js](src/middleware/errorHandler.js).

## 4) Unnecessary, repetitive, or inconsistent code

- `auth` and `adminAuth` are nearly identical. Consider a single middleware with role checks (e.g., `requireAuth` and `requireRole('admin')`). See [src/middleware/auth.js](src/middleware/auth.js).
- Firebase config uses ES module syntax but the backend uses CommonJS, and the file is unused. Remove or move it to a frontend project. See [src/config/Firebase_cofig.js](src/config/Firebase_cofig.js).
- `dbUtils` is unused. Either remove it or use it to reduce repeated `LIKE` logic. See [src/utils/dbUtils.js](src/utils/dbUtils.js).
- Duplicate route registration for `/api/users` in app startup. Remove the second registration. See [src/app.js](src/app.js).
- `Services` folder name and file names have inconsistent casing/spelling (`FireBaseServicees`, `Firebase_cofig`). Standardize to avoid import issues on case-sensitive systems. See [src/Services/FireBaseServicees.js](src/Services/FireBaseServicees.js) and [src/config/Firebase_cofig.js](src/config/Firebase_cofig.js).

## 5) Documentation and configuration gaps

- `.env.example` still references MongoDB and lacks required env vars for MySQL, Stripe, SMTP, Firebase, and front-end URLs. Update it to match the actual app requirements. See [.env.example](.env.example) and [.env.mysql](.env.mysql).
- README describes endpoints that do not exist or have different paths (e.g., `/api/products/featured` vs `/api/products/featured/all`). Update API docs to match the current routes. See [README.md](README.md) and [src/routes/product.js](src/routes/product.js).

## 6) Tests are missing

- Test files exist but are empty. Add unit tests for auth, products, cart, and payments and a small integration suite for critical flows (register -> login -> cart -> payment). See [tests/jest.setup.js](tests/jest.setup.js) and [tests/routes/category.test.js](tests/routes/category.test.js).

## 7) Suggested additions for interview-readiness

- Add linting and formatting: ESLint + Prettier with scripts (`lint`, `format`).
- Add structured logging (pino or winston) and request logging (morgan) for easier debugging.
- Add a health check that verifies DB connectivity, or expand `/api/health` to include DB status.
- Add OpenAPI/Swagger docs, or at minimum a `docs/` folder with request/response examples.
- Add migration tooling (Sequelize CLI) and a proper migration history; avoid `sync` in production.
- Add a `.env.example` that includes all required environment variables with safe placeholders.
- Add CI workflow (GitHub Actions) for lint + tests.
- Add scripts for seed data and for local dev bootstrap.

## 8) Concrete next steps (priority order)

1) Fix runtime errors in user routes (replace Mongoose calls with Sequelize equivalents). See [src/routes/users.js](src/routes/users.js).
2) Fix product route bugs (`top-featured` missing variables, images update, image schema). See [src/routes/product.js](src/routes/product.js) and [src/models/product.js](src/models/product.js).
3) Fix Stripe webhook raw body ordering and remove hardcoded test payment amount. See [src/app.js](src/app.js) and [src/routes/payments.js](src/routes/payments.js).
4) Align validation rules with models for users and products. See [src/middleware/validation.js](src/middleware/validation.js).
5) Remove dev/test middleware and secrets from repo, update `.gitignore`, and move Firebase config to env. See [src/Services/testing_purposes.js](src/Services/testing_purposes.js) and [secrets/serviceAccountKey.json](secrets/serviceAccountKey.json).
6) Update README and `.env.example` to match actual stack and endpoints. See [README.md](README.md) and [.env.example](.env.example).
7) Add a minimal test suite (auth + product + cart) and CI workflow.

---
If you want, I can help apply any of these fixes or create the test scaffolding next.

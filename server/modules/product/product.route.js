const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

// GET /api/products       — list all (with pagination, search, filter, sort)
// POST /api/products      — create new product (Protected Admin Route)
router
  .route('/')
  .get(productController.getAllProducts)
  .post(verifyToken, isAdmin, productController.createProduct);

// GET /api/products/:id   — get single product
// PUT /api/products/:id   — update product (Protected Admin Route)
// DELETE /api/products/:id — soft-delete product (Protected Admin Route)
router
  .route('/:id')
  .get(productController.getProductById)
  .put(verifyToken, isAdmin, productController.updateProduct)
  .delete(verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;

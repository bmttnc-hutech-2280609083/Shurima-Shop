const express = require('express');
const router = express.Router();
const variantController = require('./variant.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

// GET /api/variants/product/:productId
router.get('/product/:productId', variantController.getVariantsByProductId);

// POST /api/variants (Admin only)
router.post('/', verifyToken, isAdmin, variantController.createVariant);

// PUT /api/variants/:id (Admin only)
router.put('/:id', verifyToken, isAdmin, variantController.updateVariant);

// DELETE /api/variants/:id (Admin only)
router.delete('/:id', verifyToken, isAdmin, variantController.deleteVariant);

module.exports = router;

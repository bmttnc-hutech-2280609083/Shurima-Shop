const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');

// Các route thanh toán (hỗ trợ cả PATCH và PUT)
router.post('/', paymentController.create);
router.get('/', paymentController.getAll);
router.get('/order/:orderId', paymentController.getByOrderId);
router.get('/:id', paymentController.getById);

router.patch('/order/:orderId', paymentController.updateStatusByOrder);
router.put('/order/:orderId', paymentController.updateStatusByOrder);

router.patch('/:id', paymentController.updateStatus);
router.put('/:id', paymentController.updateStatus);

// 🚀 Route nhận Webhook từ SePay
router.post('/webhook/sepay', paymentController.handleSePayWebhook);

module.exports = router;

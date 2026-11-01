const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

router.post('/', verifyToken, reviewController.create);
router.get('/', verifyToken, isAdmin, reviewController.getAll);
router.get('/product/:productId', reviewController.getByProduct);
router.get('/user/:userId', verifyToken, reviewController.getByUser);
router.get('/:id', reviewController.getById);
router.put('/:id', verifyToken, reviewController.update);
router.patch('/:id', verifyToken, reviewController.update);
router.delete('/:id', verifyToken, reviewController.delete);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

router.put('/profile', verifyToken, userController.updateProfile);
router.post('/', verifyToken, isAdmin, userController.create);
router.get('/', verifyToken, isAdmin, userController.getAll);
router.get('/:id', verifyToken, isAdmin, userController.getById);
router.put('/:id', verifyToken, isAdmin, userController.update);
router.delete('/:id', verifyToken, isAdmin, userController.delete);

module.exports = router;

const express = require("express");

const router = express.Router();

const {
	getCartItems,
	getCartItemById,
	createCartItem,
	updateCartItem,
	deleteCartItem,
} = require("./cartItem.controller");

const {
	validateCreateCartItemBody,
	validateUpdateCartItemBody,
} = require("./cartItem.validation");

const { verifyToken } = require("../../middlewares/auth.middleware");

router.get("/", verifyToken, getCartItems);
router.get("/:id", verifyToken, getCartItemById);
router.post("/", verifyToken, validateCreateCartItemBody, createCartItem);
router.put("/:id", verifyToken, validateUpdateCartItemBody, updateCartItem);
router.delete("/:id", verifyToken, deleteCartItem);

module.exports = router;

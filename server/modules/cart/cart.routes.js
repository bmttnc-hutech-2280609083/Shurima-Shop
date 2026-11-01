const express = require("express");

const router = express.Router();

const {
	getCarts,
	getCartById,
	createCart,
	updateCart,
	deleteCart,
} = require("./cart.controller");

const {
	validateCreateCartBody,
	validateUpdateCartBody,
} = require("./cart.validation");

const { verifyToken } = require("../../middlewares/auth.middleware");

router.get("/", verifyToken, getCarts);
router.get("/:id", verifyToken, getCartById);
router.post("/", verifyToken, validateCreateCartBody, createCart);
router.put("/:id", verifyToken, validateUpdateCartBody, updateCart);
router.delete("/:id", verifyToken, deleteCart);

module.exports = router;

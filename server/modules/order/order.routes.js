const express = require("express");

const router = express.Router();

const {
	getOrders,
	getOrderById,
	createOrder,
	updateOrder,
	deleteOrder,
} = require("./order.controller");

const {
	validateCreateOrderBody,
	validateUpdateOrderBody,
} = require("./order.validation");

const { verifyToken, isAdmin } = require("../../middlewares/auth.middleware");

router.get("/", verifyToken, getOrders);
router.get("/:id", verifyToken, getOrderById);
router.post("/", verifyToken, validateCreateOrderBody, createOrder);

router.put("/:id", verifyToken, isAdmin, validateUpdateOrderBody, updateOrder);
router.patch("/:id", verifyToken, isAdmin, validateUpdateOrderBody, updateOrder);

router.delete("/:id", verifyToken, isAdmin, deleteOrder);

module.exports = router;

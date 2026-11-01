const express = require("express");

const router = express.Router();

const {
	getOrderItems,
	getOrderItemById,
	createOrderItem,
	updateOrderItem,
	deleteOrderItem,
} = require("./orderItem.controller");

const {
	validateCreateOrderItemBody,
	validateUpdateOrderItemBody,
} = require("./orderItem.validation");

const { verifyToken } = require("../../middlewares/auth.middleware");

router.get("/", verifyToken, getOrderItems);
router.get("/:id", verifyToken, getOrderItemById);
router.post("/", verifyToken, validateCreateOrderItemBody, createOrderItem);
router.put("/:id", verifyToken, validateUpdateOrderItemBody, updateOrderItem);
router.delete("/:id", verifyToken, deleteOrderItem);

module.exports = router;

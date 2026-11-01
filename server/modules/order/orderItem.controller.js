const mongoose = require("mongoose");

const orderItemService = require("./orderItem.service");
const Order = require("./order.model");

const getOrderItems = async (req, res) => {
	try {
		const orderItems = await orderItemService.getOrderItems();
		const filtered = req.user.role === "admin"
			? orderItems
			: orderItems.filter((item) => String(item.order?.user?._id || item.order?.user) === String(req.user.id));

		res.status(200).json({
			message: "Order items fetched successfully",
			data: filtered,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getOrderItemById = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid order item id" });
		}

		const orderItem = await orderItemService.getOrderItemById(id);

		if (!orderItem) {
			return res.status(404).json({ message: "Order item not found" });
		}

		if (req.user.role !== "admin" && String(orderItem.order?.user?._id || orderItem.order?.user) !== String(req.user.id)) {
			return res.status(403).json({ message: "You are not allowed to access this order item" });
		}

		res.status(200).json({
			message: "Order item fetched successfully",
			data: orderItem,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const createOrderItem = async (req, res) => {
	try {
		const order = await Order.findById(req.body.order);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (req.user.role !== "admin" && String(order.user) !== String(req.user.id)) {
			return res.status(403).json({ message: "You are not allowed to add items to this order" });
		}

		const orderItem = await orderItemService.createOrderItem(req.body);

		res.status(201).json({
			message: "Order item created successfully",
			data: orderItem,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({ message: error.message });
	}
};

const updateOrderItem = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid order item id" });
		}

		const existing = await orderItemService.getOrderItemById(id);
		if (!existing) {
			return res.status(404).json({ message: "Order item not found" });
		}

		if (req.user.role !== "admin" && String(existing.order?.user?._id || existing.order?.user) !== String(req.user.id)) {
			return res.status(403).json({ message: "You are not allowed to update this order item" });
		}

		const orderItem = await orderItemService.updateOrderItem(id, req.body);

		res.status(200).json({
			message: "Order item updated successfully",
			data: orderItem,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const deleteOrderItem = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid order item id" });
		}

		const existing = await orderItemService.getOrderItemById(id);
		if (!existing) {
			return res.status(404).json({ message: "Order item not found" });
		}

		if (req.user.role !== "admin" && String(existing.order?.user?._id || existing.order?.user) !== String(req.user.id)) {
			return res.status(403).json({ message: "You are not allowed to delete this order item" });
		}

		const orderItem = await orderItemService.deleteOrderItem(id);

		res.status(200).json({
			message: "Order item deleted successfully",
			data: orderItem,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getOrderItems,
	getOrderItemById,
	createOrderItem,
	updateOrderItem,
	deleteOrderItem,
};

const mongoose = require("mongoose");

const orderService = require("./order.service");

const getOrders = async (req, res) => {
	try {
		const orders = req.user.role === "admin"
			? await orderService.getOrders()
			: await orderService.getOrdersByUser(req.user.id);

		res.status(200).json({
			message: "Orders fetched successfully",
			data: orders,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getOrderById = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid order id" });
		}

		const order = await orderService.getOrderById(id);

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (req.user.role !== "admin" && String(order.user?._id || order.user) !== String(req.user.id)) {
			return res.status(403).json({ message: "You are not allowed to access this order" });
		}

		res.status(200).json({
			message: "Order fetched successfully",
			data: order,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const createOrder = async (req, res) => {
	try {
		const payload = { ...req.body };
		const actorId = req.user?.id || req.user?._id || req.user?.userId;

		if (req.user.role !== "admin") {
			if (!actorId) {
				return res.status(401).json({ message: "Invalid token payload: missing user id" });
			}
			payload.user = actorId;
		}

		const order = await orderService.createOrder(payload);

		res.status(201).json({
			message: "Order created successfully",
			data: order,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const updateOrder = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid order id" });
		}

		const order = await orderService.updateOrder(id, req.body);

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		res.status(200).json({
			message: "Order updated successfully",
			data: order,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const deleteOrder = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid order id" });
		}

		const order = await orderService.deleteOrder(id);

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		res.status(200).json({
			message: "Order deleted successfully",
			data: order,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getOrders,
	getOrderById,
	createOrder,
	updateOrder,
	deleteOrder,
};

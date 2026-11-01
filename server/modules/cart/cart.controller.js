const mongoose = require("mongoose");

const cartService = require("./cart.service");

const getCarts = async (req, res) => {
	try {
		const carts = req.user.role === "admin"
			? await cartService.getCarts()
			: await cartService.getCartsByUser(req.user.id);

		res.status(200).json({
			message: "Carts fetched successfully",
			data: carts,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getCartById = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid cart id" });
		}

		const cart = await cartService.getCartById(id);

		if (!cart) {
			return res.status(404).json({ message: "Cart not found" });
		}

		if (req.user.role !== "admin" && String(cart.user?._id || cart.user) !== String(req.user.id)) {
			return res.status(403).json({ message: "You are not allowed to access this cart" });
		}

		res.status(200).json({
			message: "Cart fetched successfully",
			data: cart,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const createCart = async (req, res) => {
	try {
		const payload = { ...req.body };
		if (req.user.role !== "admin") {
			payload.user = req.user.id;
		}

		const cart = await cartService.createCart(payload);

		res.status(201).json({
			message: "Cart created successfully",
			data: cart,
		});
	} catch (error) {
		res.status(error.status || 500).json({ message: error.message });
	}
};

const updateCart = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid cart id" });
		}

		const existingCart = await cartService.getCartById(id);

		if (!existingCart) {
			return res.status(404).json({ message: "Cart not found" });
		}

		if (req.user.role !== "admin" && String(existingCart.user?._id || existingCart.user) !== String(req.user.id)) {
			return res.status(403).json({ message: "You are not allowed to update this cart" });
		}

		const cart = await cartService.updateCart(id, req.body);

		res.status(200).json({
			message: "Cart updated successfully",
			data: cart,
		});
	} catch (error) {
		res.status(error.status || 500).json({ message: error.message });
	}
};

const deleteCart = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid cart id" });
		}

		const cart = await cartService.getCartById(id);

		if (!cart) {
			return res.status(404).json({ message: "Cart not found" });
		}

		if (req.user.role !== "admin" && String(cart.user?._id || cart.user) !== String(req.user.id)) {
			return res.status(403).json({ message: "You are not allowed to delete this cart" });
		}

		await cartService.deleteCart(id);

		res.status(200).json({
			message: "Cart deleted successfully",
			data: null,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getCarts,
	getCartById,
	createCart,
	updateCart,
	deleteCart,
};

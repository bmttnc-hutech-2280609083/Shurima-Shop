const mongoose = require("mongoose");

const cartItemService = require("./cartItem.service");
const cartService = require("./cart.service");

const getCartItems = async (req, res) => {
	try {
		const cartItems = await cartItemService.getCartItems();
		const filtered = req.user.role === "admin"
			? cartItems
			: cartItems.filter((item) => String(item.cart?.user?._id || item.cart?.user) === String(req.user.id));

		res.status(200).json({
			message: "Cart items fetched successfully",
			data: filtered,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const getCartItemById = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid cart item id" });
		}

		const cartItem = await cartItemService.getCartItemById(id);

		if (!cartItem) {
			return res.status(404).json({ message: "Cart item not found" });
		}

		if (req.user.role !== "admin" && String(cartItem.cart?.user?._id || cartItem.cart?.user) !== String(req.user.id)) {
			return res.status(403).json({ message: "You are not allowed to access this cart item" });
		}

		res.status(200).json({
			message: "Cart item fetched successfully",
			data: cartItem,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const createCartItem = async (req, res) => {
	try {
		const cart = await cartService.getCartById(req.body.cart);
		if (!cart) {
			return res.status(404).json({ message: "Cart not found" });
		}

		if (req.user.role !== "admin" && String(cart.user?._id || cart.user) !== String(req.user.id)) {
			return res.status(403).json({ message: "You are not allowed to add items to this cart" });
		}

		const cartItem = await cartItemService.createCartItem(req.body);

		res.status(201).json({
			message: "Cart item created successfully",
			data: cartItem,
		});
	} catch (error) {
		res.status(error.statusCode || 500).json({ message: error.message });
	}
};

const updateCartItem = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid cart item id" });
		}

		const existing = await cartItemService.getCartItemById(id);
		if (!existing) {
			return res.status(404).json({ message: "Cart item not found" });
		}

		if (req.user.role !== "admin" && String(existing.cart?.user?._id || existing.cart?.user) !== String(req.user.id)) {
			return res.status(403).json({ message: "You are not allowed to update this cart item" });
		}

		const cartItem = await cartItemService.updateCartItem(id, req.body);

		res.status(200).json({
			message: "Cart item updated successfully",
			data: cartItem,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const deleteCartItem = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid cart item id" });
		}

		const existing = await cartItemService.getCartItemById(id);
		if (!existing) {
			return res.status(404).json({ message: "Cart item not found" });
		}

		if (req.user.role !== "admin" && String(existing.cart?.user?._id || existing.cart?.user) !== String(req.user.id)) {
			return res.status(403).json({ message: "You are not allowed to delete this cart item" });
		}

		const cartItem = await cartItemService.deleteCartItem(id);

		res.status(200).json({
			message: "Cart item deleted successfully",
			data: cartItem,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getCartItems,
	getCartItemById,
	createCartItem,
	updateCartItem,
	deleteCartItem,
};

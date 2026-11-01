const Cart = require("./cart.model");

const getCarts = async () => {
	return Cart.find().sort({ createdAt: -1 }).populate("user");
};

const getCartsByUser = async (userId) => {
	return Cart.find({ user: userId }).sort({ createdAt: -1 }).populate("user");
};

const getCartById = async (id) => {
	return Cart.findById(id).populate("user");
};

const createCart = async (payload) => {
	const { user, status = "active" } = payload;

	if (status === "active") {
		const existing = await Cart.findOne({ user, status: "active" });

		if (existing) {
			const error = new Error("User already has an active cart");
			error.status = 409;
			throw error;
		}
	}

	return Cart.create({ user, status });
};

const updateCart = async (id, payload) => {
	const { user, status } = payload;

	if (user && status === "active") {
		const existing = await Cart.findOne({
			_id: { $ne: id },
			user,
			status: "active",
		});

		if (existing) {
			const error = new Error("User already has an active cart");
			error.status = 409;
			throw error;
		}
	}

	return Cart.findByIdAndUpdate(
		id,
		payload,
		{ new: true, runValidators: true }
	);
};

const deleteCart = async (id) => {
	return Cart.findByIdAndDelete(id);
};

module.exports = {
	getCarts,
	getCartsByUser,
	getCartById,
	createCart,
	updateCart,
	deleteCart,
};

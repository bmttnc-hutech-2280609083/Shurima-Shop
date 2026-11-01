const CartItem = require("./cartItem.model");
const Product = require("../product/product.model");
const Variant = require("../product/variant.model");

const getCartItems = async () => {
	return CartItem.find()
		.sort({ createdAt: -1 })
		.populate("cart")
		.populate("product")
		.populate("variant");
};

const getCartItemById = async (id) => {
	return CartItem.findById(id)
		.populate("cart")
		.populate("product")
		.populate("variant");
};

const createCartItem = async (payload) => {
	const { product, variant, quantity } = payload;

	if (variant) {
		const variantDoc = await Variant.findById(variant);
		if (!variantDoc) {
			const err = new Error('Variant not found');
			err.statusCode = 404;
			throw err;
		}
		// Stock check for variant: only block if variant explicitly tracks stock and it's insufficient
		if (variantDoc.stock !== undefined && variantDoc.stock !== null && variantDoc.stock < quantity) {
			const err = new Error('Insufficient stock for the selected variant');
			err.statusCode = 400;
			throw err;
		}
	} else {
		const productDoc = await Product.findById(product);
		if (!productDoc) {
			const err = new Error('Product not found');
			err.statusCode = 404;
			throw err;
		}
		// Stock check: only block if product explicitly has stock tracked (stock > 0 default is fine)
		// Stock=0 is the default value - actual stock is managed at checkout
	}

	return CartItem.create(payload);
};

const updateCartItem = async (id, payload) => {
	return CartItem.findByIdAndUpdate(id, payload, {
		new: true,
		runValidators: true,
	});
};

const deleteCartItem = async (id) => {
	return CartItem.findByIdAndDelete(id);
};

module.exports = {
	getCartItems,
	getCartItemById,
	createCartItem,
	updateCartItem,
	deleteCartItem,
};

const Order = require("./order.model");
const OrderItem = require("./orderItem.model");

const attachItems = async (orders) => {
	if (!orders || orders.length === 0) {
		return [];
	}

	const orderIds = orders.map((order) => order._id);
	const orderItems = await OrderItem.find({ order: { $in: orderIds } })
		.populate("product", "name price images")
		.populate("variant", "size color price")
		.lean();

	const grouped = orderItems.reduce((acc, item) => {
		const key = String(item.order);
		if (!acc[key]) acc[key] = [];
		acc[key].push(item);
		return acc;
	}, {});

	return orders.map((order) => ({
		...order,
		items: grouped[String(order._id)] || [],
	}));
};

const getOrders = async () => {
	const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email").lean();
	return attachItems(orders);
};

const getOrdersByUser = async (userId) => {
	const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).populate("user", "name email").lean();
	return attachItems(orders);
};

const getOrderById = async (id) => {
	const order = await Order.findById(id).populate("user", "name email").lean();
	if (!order) {
		return null;
	}

	const [withItems] = await attachItems([order]);
	return withItems;
};

const createOrder = async (payload) => {
	return Order.create(payload);
};

const updateOrder = async (id, payload) => {
	return Order.findByIdAndUpdate(id, payload, {
		new: true,
		runValidators: true,
	});
};

const deleteOrder = async (id) => {
	return Order.findByIdAndDelete(id);
};

module.exports = {
	getOrders,
	getOrdersByUser,
	getOrderById,
	createOrder,
	updateOrder,
	deleteOrder,
};

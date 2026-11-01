const Discount = require('./discount.model');
const Order = require('../order/order.model');

const normalizeCode = (code) => String(code || '').trim().toUpperCase();

const getDiscounts = async (query = {}) => {
  const { active } = query;
  const filter = {};

  if (active !== undefined) {
    filter.isActive = String(active) === 'true';
  }

  return Discount.find(filter).sort({ createdAt: -1 });
};

const getPublicActiveDiscounts = async () => {
  const now = new Date();

  return Discount.find({
    isActive: true,
    isPublic: true,
    endDate: { $gte: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
    ],
  })
    .select('code name description type value minOrderValue maxDiscount startDate endDate usageLimit usedCount')
    .sort({ endDate: 1, createdAt: -1 });
};

const getAvailableDiscounts = async () => {
  const activeDiscounts = await Discount.find({ isActive: { $ne: false } }).sort({ createdAt: -1 });
  if (activeDiscounts.length > 0) return activeDiscounts;
  return Discount.find().sort({ createdAt: -1 });
};

const getDiscountById = async (id) => {
  return Discount.findById(id);
};

const getDiscountByCode = async (rawCode) => {
  const code = normalizeCode(rawCode);
  return Discount.findOne({ code });
};

const createDiscount = async (payload) => {
  const data = { ...payload, code: normalizeCode(payload.code) };

  const existed = await Discount.findOne({ code: data.code });
  if (existed) {
    const error = new Error('Discount code already exists');
    error.status = 409;
    throw error;
  }

  return Discount.create(data);
};

const updateDiscount = async (id, payload) => {
  const data = { ...payload };
  if (data.code) data.code = normalizeCode(data.code);

  if (data.code) {
    const existed = await Discount.findOne({ _id: { $ne: id }, code: data.code });
    if (existed) {
      const error = new Error('Discount code already exists');
      error.status = 409;
      throw error;
    }
  }

  return Discount.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

const deleteDiscount = async (id) => {
  return Discount.findByIdAndDelete(id);
};

const setDiscountPublic = async (id, isPublic) => {
  return Discount.findByIdAndUpdate(
    id,
    { isPublic: Boolean(isPublic) },
    { new: true, runValidators: true }
  );
};

const applyDiscountToOrder = async ({ orderId, code, actor }) => {
  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error('Order not found');
    error.status = 404;
    throw error;
  }

  if (actor && actor.role !== 'admin' && String(order.user) !== String(actor.id)) {
    const error = new Error('You are not allowed to apply discount for this order');
    error.status = 403;
    throw error;
  }

  if (order.discount) {
    const error = new Error('Discount is already applied for this order');
    error.status = 400;
    throw error;
  }

  const discount = await getDiscountByCode(code);
  const validated = validateDiscountAvailability(discount, Number(order.totalPrice || 0));

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      discount: discount._id,
      discountCode: discount.code,
      discountAmount: validated.discountAmount,
      finalPrice: validated.finalAmount,
    },
    { new: true, runValidators: true }
  );

  await Discount.findByIdAndUpdate(discount._id, { $inc: { usedCount: 1 } });

  return {
    order: updatedOrder,
    discount,
    discountAmount: validated.discountAmount,
    finalAmount: validated.finalAmount,
  };
};

const validateDiscountAvailability = (discount, orderAmount = 0) => {
  if (!discount) {
    const error = new Error('Discount not found');
    error.status = 404;
    throw error;
  }

  const now = new Date();

  if (!discount.isActive) {
    const error = new Error('Discount is inactive');
    error.status = 400;
    throw error;
  }

  if (discount.startDate && now < discount.startDate) {
    const error = new Error('Discount is not started yet');
    error.status = 400;
    throw error;
  }

  if (discount.endDate && now > discount.endDate) {
    const error = new Error('Discount has expired');
    error.status = 400;
    throw error;
  }

  if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) {
    const error = new Error('Discount usage limit reached');
    error.status = 400;
    throw error;
  }

  const amount = Number(orderAmount || 0);
  if (amount < Number(discount.minOrderValue || 0)) {
    const error = new Error('Order amount does not meet minimum requirement');
    error.status = 400;
    throw error;
  }

  let discountAmount = 0;
  if (discount.type === 'percent') {
    discountAmount = amount * (Number(discount.value) / 100);
  } else {
    discountAmount = Number(discount.value);
  }

  if (discount.maxDiscount !== null && discount.maxDiscount !== undefined) {
    discountAmount = Math.min(discountAmount, Number(discount.maxDiscount));
  }

  discountAmount = Math.max(0, Math.min(discountAmount, amount));

  return {
    discount,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalAmount: Math.round((amount - discountAmount) * 100) / 100,
  };
};

module.exports = {
  getDiscounts,
  getPublicActiveDiscounts,
  getAvailableDiscounts,
  getDiscountById,
  getDiscountByCode,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  setDiscountPublic,
  validateDiscountAvailability,
  applyDiscountToOrder,
};

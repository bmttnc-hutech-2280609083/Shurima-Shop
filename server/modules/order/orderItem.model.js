const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: [true, 'Order is required'] },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: [true, 'Product is required'] },
  variant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant' },
  quantity: { type: Number, required: [true, 'Quantity is required'], min: [1, 'Quantity must be at least 1'] },
  price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
}, { timestamps: true });

module.exports = mongoose.model('OrderItem', orderItemSchema);
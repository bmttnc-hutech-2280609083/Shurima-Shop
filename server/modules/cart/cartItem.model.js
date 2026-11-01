const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: [true, 'Cart is required'] },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: [true, 'Product is required'] },
  variant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant' },
  quantity: { type: Number, required: [true, 'Quantity is required'], min: [1, 'Quantity must be at least 1'] },
}, { timestamps: true });

module.exports = mongoose.model('CartItem', cartItemSchema);
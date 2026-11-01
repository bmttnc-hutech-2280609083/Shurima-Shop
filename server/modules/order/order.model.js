const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalPrice: Number,
  discount: { type: mongoose.Schema.Types.ObjectId, ref: 'Discount', default: null },
  discountCode: { type: String, default: null },
  discountAmount: { type: Number, default: 0 },
  finalPrice: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'shipping', 'completed', 'cancelled'],
    default: 'pending'
  },
  address: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
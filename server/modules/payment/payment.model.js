const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  method: { type: String, enum: ['cod', 'qr'], default: 'cod', required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipping', 'completed', 'complete', 'failed', 'cancelled'],
    default: 'pending'
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

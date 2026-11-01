const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['active', 'checked_out', 'abandoned'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
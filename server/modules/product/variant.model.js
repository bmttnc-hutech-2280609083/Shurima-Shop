const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: [true, 'productId is required'] 
  },
  size: { 
    type: String, 
    required: [true, 'size is required'] 
  },
  color: { 
    type: String, 
    required: [true, 'color is required'] 
  },
  stock: { 
    type: Number, 
    default: 0, 
    min: [0, 'Stock cannot be negative'] 
  },
  price: { 
    type: Number 
  }
}, { timestamps: true });

// Prevent duplicate variant (same productId + size + color)
variantSchema.index({ productId: 1, size: 1, color: 1 }, { unique: true });

module.exports = mongoose.model('Variant', variantSchema);
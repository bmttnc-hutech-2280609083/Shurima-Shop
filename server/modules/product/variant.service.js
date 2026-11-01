const Variant = require('./variant.model');
const Product = require('./product.model');

const createVariant = async (data) => {
  const { productId, size, color } = data;

  // Check if product exists
  const productExists = await Product.findById(productId);
  if (!productExists) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  // The composite unique index in Mongoose model will catch exact duplicates,
  // but explicitly checking provides a cleaner error structure.
  const existingVariant = await Variant.findOne({ productId, size, color });
  if (existingVariant) {
    const error = new Error('Variant with this size and color already exists for this product');
    error.statusCode = 409;
    throw error;
  }

  return Variant.create(data);
};

const getVariantsByProductId = async (productId) => {
  return Variant.find({ productId });
};

const updateVariant = async (id, data) => {
  const variant = await Variant.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!variant) {
    const error = new Error('Variant not found');
    error.statusCode = 404;
    throw error;
  }

  return variant;
};

const deleteVariant = async (id) => {
  const variant = await Variant.findByIdAndDelete(id);

  if (!variant) {
    const error = new Error('Variant not found');
    error.statusCode = 404;
    throw error;
  }

  return { message: 'Variant deleted successfully' };
};

module.exports = {
  createVariant,
  getVariantsByProductId,
  updateVariant,
  deleteVariant
};

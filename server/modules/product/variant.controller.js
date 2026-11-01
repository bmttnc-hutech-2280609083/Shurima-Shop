const variantService = require('./variant.service');
const { variantSchema, updateVariantSchema } = require('./variant.validation');

const createVariant = async (req, res) => {
  try {
    const { error, value } = variantSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: error.details.map((d) => d.message)
      });
    }

    const variant = await variantService.createVariant(value);
    res.status(201).json({ success: true, data: variant });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

const getVariantsByProductId = async (req, res) => {
  try {
    const variants = await variantService.getVariantsByProductId(req.params.productId);
    res.status(200).json({ success: true, data: variants });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

const updateVariant = async (req, res) => {
  try {
    const { error, value } = updateVariantSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: error.details.map((d) => d.message)
      });
    }

    const variant = await variantService.updateVariant(req.params.id, value);
    res.status(200).json({ success: true, data: variant });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const result = await variantService.deleteVariant(req.params.id);
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    res.status(error.statusCode || 500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
};

module.exports = {
  createVariant,
  getVariantsByProductId,
  updateVariant,
  deleteVariant
};

const Review = require('./review.model');
const Product = require('../product/product.model');

/**
 * Recalculate and persist the average rating on the product after any review change.
 */
const recalcAvgRating = async (productId) => {
    const reviews = await Review.find({ product: productId });
    const avg = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    await Product.findByIdAndUpdate(productId, { avgRating: Math.round(avg * 10) / 10 });
};

module.exports = {
    CreateReview: async function (userId, productId, rating, comment) {
        let newReview = new Review({
            user: userId,
            product: productId,
            rating: rating,
            comment: comment
        });
        const saved = await newReview.save();
        await recalcAvgRating(productId);
        return saved;
    },
    GetAllReviews: async function () {
        return await Review.find()
            .populate('user', 'name email')
            .populate('product', 'name price');
    },
    GetReviewById: async function (id) {
        return await Review.findById(id).populate('user').populate('product');
    },
    GetReviewsByProduct: async function (productId) {
        return await Review.find({ product: productId }).populate('user', 'name');
    },
    GetReviewsByUser: async function (userId) {
        return await Review.find({ user: userId }).populate('product', 'name images');
    },
    UpdateReview: async function (id, updateData) {
        const review = await Review.findByIdAndUpdate(id, updateData, { new: true });
        if (review) await recalcAvgRating(review.product);
        return review;
    },
    DeleteReview: async function (id) {
        const review = await Review.findById(id);
        const result = await Review.findByIdAndDelete(id);
        if (review) await recalcAvgRating(review.product);
        return result;
    }
};

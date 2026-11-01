const reviewService = require('./review.service');
const { createReviewSchema, updateReviewSchema } = require('./review.validation');

module.exports = {
    // POST /review
    create: async (req, res) => {
        try {
            const { error } = createReviewSchema.validate(req.body);
            if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });

            const { productId, rating, comment } = req.body;
            const userId = req.user.role === 'admin' && req.body.userId ? req.body.userId : req.user.id;
            const newReview = await reviewService.CreateReview(userId, productId, rating, comment);
            res.status(201).json({ status: 'success', data: newReview });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },
    
    // GET /review
    getAll: async (req, res) => {
        try {
            const reviews = await reviewService.GetAllReviews();
            res.status(200).json({ status: 'success', data: reviews });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // GET /review/:id
    getById: async (req, res) => {
        try {
            const review = await reviewService.GetReviewById(req.params.id);
            if (!review) return res.status(404).json({ status: 'error', message: 'Review not found' });
            res.status(200).json({ status: 'success', data: review });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // GET /review/product/:productId
    getByProduct: async (req, res) => {
        try {
            const reviews = await reviewService.GetReviewsByProduct(req.params.productId);
            res.status(200).json({ status: 'success', data: reviews });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // GET /review/user/:userId
    getByUser: async (req, res) => {
        try {
            if (req.user.role !== 'admin' && String(req.params.userId) !== String(req.user.id)) {
                return res.status(403).json({ status: 'error', message: 'You are not allowed to access these reviews' });
            }

            const reviews = await reviewService.GetReviewsByUser(req.params.userId);
            res.status(200).json({ status: 'success', data: reviews });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // PUT /review/:id
    update: async (req, res) => {
        try {
            const { error } = updateReviewSchema.validate(req.body);
            if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });

            const review = await reviewService.GetReviewById(req.params.id);
            if (!review) return res.status(404).json({ status: 'error', message: 'Review not found' });

            if (req.user.role !== 'admin' && String(review.user?._id || review.user) !== String(req.user.id)) {
                return res.status(403).json({ status: 'error', message: 'You are not allowed to update this review' });
            }

            const updatedReview = await reviewService.UpdateReview(req.params.id, req.body);
            res.status(200).json({ status: 'success', data: updatedReview });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // DELETE /review/:id
    delete: async (req, res) => {
        try {
            const review = await reviewService.GetReviewById(req.params.id);
            if (!review) return res.status(404).json({ status: 'error', message: 'Review not found' });

            if (req.user.role !== 'admin' && String(review.user?._id || review.user) !== String(req.user.id)) {
                return res.status(403).json({ status: 'error', message: 'You are not allowed to delete this review' });
            }

            const result = await reviewService.DeleteReview(req.params.id);
            res.status(200).json({ status: 'success', message: 'Review deleted successfully' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
};

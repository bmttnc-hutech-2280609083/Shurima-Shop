const Payment = require('./payment.model');
const Order = require('../order/order.model');

module.exports = {
    CreatePayment: async function (orderId, method, actor) {
        const order = await Order.findById(orderId);
        if (!order) {
            const err = new Error('Order not found');
            err.statusCode = 404;
            throw err;
        }

        if (actor && actor.role !== 'admin' && String(order.user) !== String(actor.id)) {
            const err = new Error('You are not allowed to create payment for this order');
            err.statusCode = 403;
            throw err;
        }

        let newPayment = new Payment({ order: orderId, method });
        return await newPayment.save();
    },

    GetAllPayments: async function () {
        return await Payment.find().populate('order');
    },
    GetPaymentById: async function (id, actor) {
        const payment = await Payment.findById(id).populate('order');

        if (!payment) {
            return null;
        }

        if (actor && actor.role !== 'admin' && String(payment.order?.user) !== String(actor.id)) {
            const err = new Error('You are not allowed to access this payment');
            err.statusCode = 403;
            throw err;
        }

        return payment;
    },
    GetPaymentByOrder: async function (orderId, actor) {
        const payment = await Payment.findOne({ order: orderId }).populate('order');

        if (!payment) {
            return null;
        }

        if (actor && actor.role !== 'admin' && String(payment.order?.user) !== String(actor.id)) {
            const err = new Error('You are not allowed to access this payment');
            err.statusCode = 403;
            throw err;
        }

        return payment;
    },
    UpdatePaymentStatus: async function (id, status) {
        return await Payment.findByIdAndUpdate(id, { status }, { new: true });
    },
    UpdateStatusByOrderId: async function (orderId, status) {
        return await Payment.findOneAndUpdate({ order: orderId }, { status }, { new: true });
    }
};

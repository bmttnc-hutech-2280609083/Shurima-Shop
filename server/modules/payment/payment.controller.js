const paymentService = require('./payment.service');
const { createPaymentSchema, updatePaymentStatusSchema } = require('./payment.validation');

module.exports = {
    // POST /payment
    create: async (req, res) => {
        try {
            const { error } = createPaymentSchema.validate(req.body);
            if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });

            const { orderId, method } = req.body;
            const newPayment = await paymentService.CreatePayment(orderId, method, req.user);
            res.status(201).json({ status: 'success', data: newPayment });
        } catch (error) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    // GET /payment
    getAll: async (req, res) => {
        try {
            const payments = await paymentService.GetAllPayments();
            res.status(200).json({ status: 'success', data: payments });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // GET /payment/:id
    getById: async (req, res) => {
        try {
            const payment = await paymentService.GetPaymentById(req.params.id, req.user);
            if (!payment) return res.status(404).json({ status: 'error', message: 'Payment not found' });
            res.status(200).json({ status: 'success', data: payment });
        } catch (error) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    // GET /payment/order/:orderId
    getByOrderId: async (req, res) => {
        try {
            const payment = await paymentService.GetPaymentByOrder(req.params.orderId, req.user);
            if (!payment) return res.status(404).json({ status: 'error', message: 'Payment not found for this order' });
            res.status(200).json({ status: 'success', data: payment });
        } catch (error) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    // PUT|PATCH /payment/:id
    updateStatus: async (req, res) => {
        try {
            const { error, value } = updatePaymentStatusSchema.validate(req.body);
            if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });

            let status = value.status;
            if (status === 'complete') status = 'completed';
            if (status === 'Paid') status = 'paid';

            const updatedPayment = await paymentService.UpdatePaymentStatus(req.params.id, status);
            if (!updatedPayment) return res.status(404).json({ status: 'error', message: 'Payment not found' });
            res.status(200).json({ status: 'success', data: updatedPayment });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // PUT|PATCH /payment/order/:orderId
    updateStatusByOrder: async (req, res) => {
        try {
            const { error, value } = updatePaymentStatusSchema.validate(req.body);
            if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });

            let status = value.status;
            if (status === 'complete') status = 'completed';
            if (status === 'Paid') status = 'paid';

            const updatedPayment = await paymentService.UpdateStatusByOrderId(req.params.orderId, status);
            if (!updatedPayment) return res.status(404).json({ status: 'error', message: 'Payment not found for this order' });
            res.status(200).json({ status: 'success', data: updatedPayment });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    // POST /payment/webhook/sepay - Xử lý tự động webhook thanh toán từ SePay
    handleSePayWebhook: async (req, res) => {
        try {
            // Kiểm tra bảo mật SePay API Key từ Header (nếu có cấu hình biến môi trường)
            const authorizationHeader = req.headers.authorization;
            if (process.env.SEPAY_API_KEY && authorizationHeader !== `Apikey ${process.env.SEPAY_API_KEY}`) {
                return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid SePay API Key' });
            }

            const webhookData = req.body;
            const { transferType, content } = webhookData;

            // Chỉ xử lý các giao dịch tiền chuyển vào (in)
            if (transferType !== 'in') {
                return res.status(200).json({ status: 'success', message: 'Ignored outbound transaction' });
            }

            // Bóc tách mã đơn hàng từ nội dung chuyển khoản (Ví dụ cú pháp: "DH12345")
            const match = content.match(/DH([a-zA-Z0-9]+)/);
            if (!match) {
                return res.status(200).json({ status: 'success', message: 'Order code not found in transfer content' });
            }
            const orderId = match[0];

            // Tự động cập nhật trạng thái thanh toán thành công ('paid') qua service
            const updatedPayment = await paymentService.UpdateStatusByOrderId(orderId, 'paid');
            if (!updatedPayment) {
                return res.status(404).json({ status: 'error', message: 'Payment or Order not found for this webhook' });
            }

            return res.status(200).json({
                status: 'success',
                message: 'Webhook processed successfully, payment status updated to paid'
            });

        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
};

const express = require("express");
const cors = require("cors");

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = [
    "http://localhost:3000",
    /^http:\/\/localhost:(?:\d+)$/,
    /^http:\/\/127\.0\.0\.1:(?:\d+)$/,
];

app.use(cors({
    origin(origin, callback) {
        // Allow non-browser tools like Postman/curl without Origin header.
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some((rule) => {
            if (typeof rule === "string") return rule === origin;
            return rule.test(origin);
        });

        if (isAllowed) return callback(null, origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));

// ─── Body Parsers ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- KHAI BÁO CÁC ROUTES ĐÃ TẠO ----
app.use("/api/auth", require("./modules/auth/auth.route"));
app.use("/api/products", require("./modules/product/product.route"));
app.use("/api/brands", require("./modules/brand/brand.routes"));
app.use("/api/variants", require("./modules/product/variant.route"));
app.use("/api/categories", require("./modules/category/category.routes"));
app.use("/api/orders", require("./modules/order/order.routes"));
app.use("/api/order-items", require("./modules/order/orderItem.routes"));
app.use("/api/carts", require("./modules/cart/cart.routes"));
app.use("/api/cart-items", require("./modules/cart/cartItem.routes"));
app.use("/api/users", require("./modules/user/user.route"));
app.use("/api/reviews", require("./modules/review/review.route"));
app.use("/api/discounts", require("./modules/discount/discount.routes"));
app.use("/api/payments", require("./modules/payment/payment.route"));

app.get("/health", (req, res) => {
    res.status(200).json({
        message: "Server is running",
        env: process.env.NODE_ENV || "development"
    });
});

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).json({
        success: false,
        message: err.message || "Internal server error",
    });
});
module.exports = app;

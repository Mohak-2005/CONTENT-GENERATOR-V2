const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const Payment = require("../models/Payment"); // <-- ADD THIS
const {
  handleStripePayment,
  handleFreeSubscription,
  verifyPayment,
} = require("../controllers/handleStripePayment"); // ✅ fixed capital S

const stripeRouter = express.Router();

stripeRouter.post("/checkout", isAuthenticated, handleStripePayment); // ✅ fixed capital S
stripeRouter.post("/free-plan", isAuthenticated, handleFreeSubscription);
stripeRouter.post("/verify-payment/:paymentId", isAuthenticated, verifyPayment);

module.exports = stripeRouter;

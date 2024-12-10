const express = require("express");
const { processPayment,sendStripeApiKey,} = require("../controlers/paymentController"); 
const router = express.Router();
const { isAuthenticated } = require("../middleware/Auth");




// Payment processing route
router.route("/payment/process").post(isAuthenticated, processPayment);

// Route to send the Stripe API key
router.route("/stripeapikey").get(isAuthenticated, sendStripeApiKey);

module.exports = router;

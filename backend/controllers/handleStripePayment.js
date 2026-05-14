const asyncHandler = require("express-async-handler");
const Payment = require("../models/Payment");
const User = require("../models/User");

const {
  calculateNextBillingDate,
} = require("../utils/calculateNextBillingDate");

const {
  shouldRenewSubscriptionPlan,
} = require("../utils/shouldRenewsubscriptionPlan");

//* future addition real stripe payment.
//* const Stripe = require("stripe");
//* const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

//! ===============================
//! Stripe Payment
//! ===============================
const handleStripePayment = asyncHandler(async (req, res) => {
  const { amount, subscriptionPlan } = req.body;

  //* getting the logged-in user
  const user = req?.user;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "inr",

      //* metadata for later verification
      metadata: {
        userId: user?._id.toString(),
        userEmail: user?.email,
        subscriptionPlan,
      },
    });

    console.log(paymentIntent);

    //* send response
    res.json({
      clientSecret: paymentIntent?.client_secret,
      paymentId: paymentIntent?.id,
      metadata: paymentIntent?.metadata,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

//! ===============================
//! Verify Payment
//! ===============================
const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  try {
    //* Correct Stripe API call
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

    if (paymentIntent.status === "succeeded") {
      //* metadata
      const metadata = paymentIntent?.metadata;
      const subscriptionPlan = metadata?.subscriptionPlan;
      const userEmail = metadata?.userEmail;
      const userId = metadata?.userId;

      //* find user
      const userFound = await User.findById(userId);

      if (!userFound) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      //* payment details
      const amount = paymentIntent?.amount / 100;
      const currency = paymentIntent?.currency;
      const reference = paymentIntent?.id;

      //* create payment history
      const newPayment = await Payment.create({
        user: userId,
        subscriptionPlan,
        amount,
        currency,
        status: "success",
        reference,
      });

      //* update user based on plan
      let monthlyRequestCount = 0;

      if (subscriptionPlan === "Basic") {
        monthlyRequestCount = 50;
      }

      if (subscriptionPlan === "Premium") {
        monthlyRequestCount = 100;
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          subscriptionPlan,
          trialPeriod: 0,
          nextBillingDate: calculateNextBillingDate(),
          apiRequestCount: 0,
          monthlyRequestCount,
          $addToSet: {
            payments: newPayment?._id,
          },
        },
        { new: true },
      );

      return res.json({
        status: true,
        message: "Payment verified successfully",
        updatedUser,
      });
    }

    return res.status(400).json({
      status: false,
      message: "Payment not completed yet",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

//! ===============================
//! Free Subscription ($0)
//! ===============================
const handleFreeSubscription = asyncHandler(async (req, res) => {
  const user = req?.user;

  try {
    if (shouldRenewSubscriptionPlan(user)) {
      //* update user account
      user.subscriptionPlan = "Free";
      user.monthlyRequestCount = 50;
      user.apiRequestCount = 0;
      user.nextBillingDate = calculateNextBillingDate();

      //* create payment record
      const newPayment = await Payment.create({
        user: user?._id,
        subscriptionPlan: "Free",
        amount: 0,
        status: "success",
        reference: Math.random().toString(36).substring(7),
        monthlyRequestCount: 50,
        currency: "inr",
      });

      user.payments.push(newPayment?._id);

      //* save user
      await user.save();

      return res.json({
        status: "success",
        message: "Free subscription activated successfully",
      });
    } else {
      return res.status(403).json({
        error: "Subscription renewal not due yet",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

module.exports = {
  handleStripePayment,
  handleFreeSubscription,
  verifyPayment,
};

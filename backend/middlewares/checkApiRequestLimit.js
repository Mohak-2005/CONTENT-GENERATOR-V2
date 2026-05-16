const asyncHandler = require("express-async-handler");
const User = require("../models/User"); // ✅ fixed: missing import

const checkApiRequestLimit = asyncHandler(async (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
    }

    // ✅ find the user
    const user = await User.findById(req?.user?._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // ✅ Determine the monthly request limit based on plan/trial
    let requestLimit = user?.monthlyRequestCount ?? 100;

    if (!user?.trialActive) {
        // Trial expired — use plan-based limits
        if (user?.subscriptionPlan === "Basic") requestLimit = 50;
        else if (user?.subscriptionPlan === "Premium") requestLimit = 100;
        else requestLimit = user?.monthlyRequestCount ?? 100; // Free / fallback
    }

    // ✅ Block only if the user has genuinely hit the limit
    if (user?.apiRequestCount >= requestLimit) {
        throw new Error(
            "API request limit exceeded, please subscribe to a plan to access new features."
        );
    }

    next();
});

module.exports = checkApiRequestLimit;

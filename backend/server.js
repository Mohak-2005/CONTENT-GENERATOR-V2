require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 5000;

const usersRouter = require("./routes/usersRouter");
const connectDB = require("./utils/connectDB");
const { errorHandler } = require("./middlewares/errormiddleware");
const openAIRouter = require("./routes/openAIRouter");
const stripeRouter = require("./routes/stripeRouter");
const User = require("./models/User");

connectDB();

//* Cron for trial period: runs daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Trial period check running...");
  try {
    const today = new Date();

    const updatedUser = await User.updateMany(
      {
        trialActive: true,
        trialExpires: { $lt: today }, // lt means less than
      },
      {
        trialActive: false,
        subscriptionPlan: "Free",
        monthlyRequestCount: 0,
      },
    );

    console.log("Trial users updated:", updatedUser.modifiedCount);
  } catch (error) {
    console.error(error);
  }
});

//* Cron for free plan: runs on the 1st of every month at midnight
cron.schedule("0 0 1 * *", async () => {
  console.log("Free plan reset running...");
  try {
    const today = new Date();

    await User.updateMany(
      {
        subscriptionPlan: "Free",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 0,
      },
    );
  } catch (error) {
    console.error(error);
  }
});

//* Cron for basic plan: runs on the 1st of every month at midnight
cron.schedule("0 0 1 * *", async () => {
  console.log("Basic plan reset running...");
  try {
    const today = new Date();

    await User.updateMany(
      {
        subscriptionPlan: "Basic",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 0,
      },
    );
  } catch (error) {
    console.error(error);
  }
});

//* Cron for premium plan: runs on the 1st of every month at midnight
cron.schedule("0 0 1 * *", async () => {
  console.log("Premium plan reset running...");
  try {
    const today = new Date();

    await User.updateMany(
      {
        subscriptionPlan: "Premium",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 0,
      },
    );
  } catch (error) {
    console.error(error);
  }
});

//* ---------------- Middleware ----------------

// Parse JSON payload
app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// CORS setup for frontend connection
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

//* ---------------- Routes ----------------

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/openai", openAIRouter);
app.use("/api/v1/stripe", stripeRouter);

//* ---------------- Error Handler ----------------

app.use(errorHandler);

//* ---------------- Start Server ----------------

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const mongoose = require("mongoose");

//* schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    trialPeriod : {
        type : Number,
        default : 3, //* 3 days default period
    },

    trialActive: {
      type: Boolean,
      default: true,
    },

    trialExpires: {
      type: Date,
    },

    subscriptionPlan: {
      type: String,
      enum: ["Trial", "Free", "Basic", "Premium"],
    },

    apiRequestCount: {
      type: Number,
      default: 0,
    },

    monthlyRequestCount: {
      type: Number,
      default: 100, //* 100 credits for the user
    },

    nextBillingDate: {
      type: Date,
    },

    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],

    history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ContentHistory",  // ✅ fixed: was "History", now matches the model name
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//* add Virtual property
/* userSchema.virtual("isTrialActive").get(function(){
  return this.trialActive && new Date() < this.trialExpires;
});
*/

//* compile to form the model
const User = mongoose.model("User", userSchema);

module.exports = User;
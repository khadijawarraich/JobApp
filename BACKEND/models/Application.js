const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    companyName: {
      type: String,
      required: true,
    },

    jobTitle: {
      type: String,
      required: true,
    },

    location: String,
    jobLink: String,
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    interviewDate: Date,
    notes: String,

    status: {
      type: String,
      enum: ["Wishlist", "Applied", "Interviewing", "Offer", "Rejected"],
      default: "Wishlist",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
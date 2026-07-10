import mongoose from "mongoose";

const groupBuySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetQuantity: {
      type: Number,
      required: true,
      min: 2,
    },
    currentQuantity: {
      type: Number,
      default: 1,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "fulfilled", "expired", "cancelled"],
      default: "active",
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        paid: {
          type: Boolean,
          default: false,
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
      },
    ],
    messages: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Indexes
groupBuySchema.index({ status: 1 });
groupBuySchema.index({ expiresAt: 1 });
groupBuySchema.index({ product: 1 });
groupBuySchema.index({ "members.user": 1 });

// Virtuals
groupBuySchema.virtual("membersCount").get(function () {
  return this.members.length;
});

groupBuySchema.virtual("progress").get(function () {
  return ((this.currentQuantity / this.targetQuantity) * 100).toFixed(1);
});

groupBuySchema.virtual("timeRemaining").get(function () {
  if (this.expiresAt < new Date()) return "Expired";
  const diff = this.expiresAt - new Date();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
});

const GroupBuy = mongoose.model("GroupBuy", groupBuySchema);

export default GroupBuy;

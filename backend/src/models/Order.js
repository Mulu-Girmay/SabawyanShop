import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
        total: Number,
        image: String,
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    groupBuy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupBuy",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "paypal", "bank_transfer", "wallet"],
      required: true,
    },
    paymentDetails: {
      transactionId: String,
      paymentIntent: String,
      paymentMethodId: String,
    },
    shippingAddress: {
      name: String,
      address: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
      phone: String,
    },
    trackingNumber: String,
    trackingCompany: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    notes: String,
    buyerComments: String,
    sellerComments: String,
    history: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to generate order number
orderSchema.pre("save", async function () {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.orderNumber = `COLLAB-${year}${month}${day}-${random}`;
  }
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ buyer: 1 });
orderSchema.index({ seller: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Electronics",
        "Fashion",
        "Home & Garden",
        "Beauty",
        "Books",
        "Food",
        "Toys",
        "Sports",
        "Automotive",
        "Other",
      ],
    },
    subCategory: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    videos: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isGroupBuyable: {
      type: Boolean,
      default: false,
    },
    groupBuySettings: {
      minQuantity: Number,
      discountPercentage: Number,
      tieredPricing: [
        {
          quantity: Number,
          price: Number,
        },
      ],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [String],
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    shipping: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      cost: Number,
      freeShipping: { type: Boolean, default: false },
    },
    returnPolicy: {
      type: String,
      default: "30 days return policy",
    },
  },
  {
    timestamps: true,
  },
);

// Text index for search
productSchema.index({
  title: "text",
  description: "text",
  category: "text",
  tags: "text",
});

// Indexes for filtering
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ isGroupBuyable: 1 });

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (!this.discountPrice) return 0;
  return (((this.price - this.discountPrice) / this.price) * 100).toFixed(0);
});

// Virtual for in stock
productSchema.virtual("inStock").get(function () {
  return this.quantity > 0;
});

const Product = mongoose.model("Product", productSchema);

export default Product;

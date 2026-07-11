import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscore",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSeller: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sellerProfile: {
      storeName: String,
      storeDescription: String,
      storeLogo: String,
      storeBanner: String,
      rating: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
      responseTime: String,
      isActive: { type: Boolean, default: true },
      verificationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      documents: [
        {
          type: String,
        },
      ],
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
      },
      privacy: {
        profileVisibility: {
          type: String,
          enum: ["public", "followers", "private"],
          default: "public",
        },
        showEmail: { type: Boolean, default: false },
      },
    },
    savedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        type: {
          type: String,
          enum: ["home", "work", "other"],
          default: "home",
        },
        name: String,
        address: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
        phone: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ "sellerProfile.storeName": "text" });
userSchema.index({ fullName: "text" });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual("followersCount").get(function () {
  return this.followers.length;
});

userSchema.virtual("followingCount").get(function () {
  return this.following.length;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

const User = mongoose.model("User", userSchema);

export default User;

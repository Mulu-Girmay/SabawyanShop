import Product from "../models/Product.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import logger from "../utils/logger.js";

export const createProduct = async (req, res, next) => {
  try {
    const productData = {
      ...req.body,
      seller: req.user.id,
    };

    // Handle price and discount
    if (
      productData.discountPrice &&
      productData.discountPrice >= productData.price
    ) {
      return res.status(400).json({
        success: false,
        error: "Discount price must be less than original price",
      });
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    logger.error("Create product error:", error);
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      rating,
      seller,
      search,
      isGroupBuyable,
      limit = 20,
      page = 1,
      sort = "-createdAt",
    } = req.query;

    const query = { isActive: true };

    // Apply filters
    if (category) query.category = category;
    if (seller) query.seller = seller;
    if (isGroupBuyable !== undefined)
      query.isGroupBuyable = isGroupBuyable === "true";

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (rating) query.rating = { $gte: parseFloat(rating) };

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate("seller", "username fullName avatar isVerified sellerProfile")
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Get products error:", error);
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate(
      "seller",
      "username fullName avatar isVerified sellerProfile followers",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error("Get product error:", error);
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check ownership
    if (product.seller.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this product",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    logger.error("Update product error:", error);
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check ownership or admin
    if (product.seller.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this product",
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    logger.error("Delete product error:", error);
    next(error);
  }
};

export const uploadProductImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    if (product.seller.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please upload at least one image",
      });
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, {
        folder: "products",
        width: 800,
        height: 800,
        crop: "limit",
      }),
    );

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result) => result.secure_url);

    // Add to existing images
    product.images = [...product.images, ...imageUrls];
    await product.save();

    res.json({
      success: true,
      message: "Images uploaded successfully",
      data: { images: product.images },
    });
  } catch (error) {
    logger.error("Upload product images error:", error);
    next(error);
  }
};

export const getProductsBySeller = async (req, res, next) => {
  try {
    const { sellerId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const query = {
      seller: sellerId,
      isActive: true,
    };

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort("-createdAt")
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Get products by seller error:", error);
    next(error);
  }
};

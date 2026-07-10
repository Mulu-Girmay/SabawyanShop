import Joi from "joi";

export const validateRegistration = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    fullName: Joi.string().min(2).max(50).required(),
    isSeller: Joi.boolean(),
  });

  return schema.validate(data);
};

export const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

export const validateProduct = (data) => {
  const schema = Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().max(5000).required(),
    price: Joi.number().positive().required(),
    discountPrice: Joi.number().positive(),
    quantity: Joi.number().integer().min(0).required(),
    category: Joi.string().required(),
    subCategory: Joi.string(),
    images: Joi.array().items(Joi.string()),
    isGroupBuyable: Joi.boolean(),
    groupBuySettings: Joi.object({
      minQuantity: Joi.number().integer().min(2),
      discountPercentage: Joi.number().min(0).max(100),
      tieredPricing: Joi.array().items(
        Joi.object({
          quantity: Joi.number().integer(),
          price: Joi.number().positive(),
        }),
      ),
    }),
    specifications: Joi.array().items(
      Joi.object({
        key: Joi.string(),
        value: Joi.string(),
      }),
    ),
    shipping: Joi.object({
      weight: Joi.number(),
      dimensions: Joi.object({
        length: Joi.number(),
        width: Joi.number(),
        height: Joi.number(),
      }),
      cost: Joi.number(),
      freeShipping: Joi.boolean(),
    }),
  });

  return schema.validate(data);
};

export const validateGroupBuy = (data) => {
  const schema = Joi.object({
    productId: Joi.string().required(),
    targetQuantity: Joi.number().integer().min(2).required(),
    expiresAt: Joi.date().greater("now").required(),
  });

  return schema.validate(data);
};

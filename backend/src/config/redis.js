import logger from "../utils/logger.js";

export const redisClient = {
  get: async (key) => null,
  set: async (key, value, mode, duration) => null,
  del: async (key) => null,
  connect: async () => logger.info("Mock Redis Connected"),
};

export default redisClient;

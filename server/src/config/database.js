import prisma from '../lib/prisma.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('PostgreSQL connected via Prisma');
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

import { Request, Response } from 'express';
import { seedDatabase } from '../helpers/seedDatabase';
import { sendSuccess, sendError } from '../helpers/responseHelper';
import Product from '../models/Product';
import SubProduct from '../models/SubProduct';

export const seedDatabaseHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { force } = req.query;
    if (force === 'true') {
      await Product.deleteMany({});
      await SubProduct.deleteMany({});
    }
    await seedDatabase();
    sendSuccess(res, null, 'Database seeded successfully');
  } catch (error) {
    sendError(res, (error as Error).message, 500);
  }
};

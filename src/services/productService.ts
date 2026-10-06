import Product, { IProduct } from '../models/Product';

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface IPaginatedResult {
  products: IProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ProductService {
  async getPaginatedProducts(options: IPaginationOptions = {}): Promise<IPaginatedResult> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 8));
    const skip = (page - 1) * limit;

    const query: any = {};

    // Category filter
    if (options.category && options.category !== 'ALL' && options.category !== 'all') {
      query.category = { $regex: new RegExp(`^${options.category.trim()}$`, 'i') };
    }

    // Search filter across name, category, shortDescription, and description
    if (options.search && options.search.trim()) {
      const searchRegex = new RegExp(options.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { targetPests: searchRegex },
        { shortDescription: searchRegex },
        { description: searchRegex },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getAllProducts(filter: object = {}): Promise<IProduct[]> {
    return await Product.find(filter).sort({ createdAt: -1 });
  }

  async getProductById(id: string): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(data);
    return await product.save();
  }

  async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteProduct(id: string): Promise<IProduct | null> {
    return await Product.findByIdAndDelete(id);
  }
}

export default new ProductService();

import SubProduct, { ISubProduct } from '../models/SubProduct';

export class SubProductService {
  async getAllSubProducts(filter: any = {}): Promise<ISubProduct[]> {
    const query = filter.productId 
      ? { $or: [{ productId: filter.productId }, { parentProductId: filter.productId }] }
      : filter;
    const items = await SubProduct.find(query).sort({ createdAt: -1 });
    return items;
  }

  async getSubProductById(id: string): Promise<ISubProduct | null> {
    return await SubProduct.findById(id);
  }

  async getSubProductsByProductId(productId: string): Promise<ISubProduct[]> {
    return await SubProduct.find({
      $or: [
        { productId: productId },
        { parentProductId: productId }
      ]
    }).sort({ createdAt: -1 });
  }

  async createSubProduct(data: Partial<ISubProduct>): Promise<ISubProduct> {
    const subProduct = new SubProduct(data);
    return await subProduct.save();
  }

  async updateSubProduct(id: string, data: Partial<ISubProduct>): Promise<ISubProduct | null> {
    return await SubProduct.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteSubProduct(id: string): Promise<ISubProduct | null> {
    return await SubProduct.findByIdAndDelete(id);
  }
}

export default new SubProductService();

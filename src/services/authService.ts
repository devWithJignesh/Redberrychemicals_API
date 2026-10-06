import User, { IUser } from '../models/User';

export class AuthService {
  /**
   * Find user by email address
   */
  async findUserByEmail(email: string): Promise<IUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    return await User.findOne({ email: cleanEmail });
  }

  /**
   * Register / Create a new user with hashed password
   */
  async createUser(userData: { name: string; email: string; password: string; role?: 'admin' | 'user' }): Promise<IUser> {
    const user = new User({
      name: userData.name,
      email: userData.email.trim().toLowerCase(),
      password: userData.password.trim(),
      role: userData.role || 'admin',
    });
    return await user.save();
  }

  /**
   * Authenticate user credentials against MongoDB
   */
  async authenticateUser(email: string, password: string): Promise<{ user: IUser; token: string } | null> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      return null;
    }

    const isMatch = await user.comparePassword(password.trim());
    if (!isMatch) {
      return null;
    }

    const token = `jwt-token-${user._id}-${Date.now()}`;
    return { user, token };
  }
}

export default new AuthService();

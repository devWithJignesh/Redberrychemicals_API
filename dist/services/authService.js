"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_1 = __importDefault(require("../models/User"));
class AuthService {
    /**
     * Find user by email address
     */
    async findUserByEmail(email) {
        const cleanEmail = email.trim().toLowerCase();
        return await User_1.default.findOne({ email: cleanEmail });
    }
    /**
     * Register / Create a new user with hashed password
     */
    async createUser(userData) {
        const user = new User_1.default({
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
    async authenticateUser(email, password) {
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
exports.AuthService = AuthService;
exports.default = new AuthService();

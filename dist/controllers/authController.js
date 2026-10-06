"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const authService_1 = __importDefault(require("../services/authService"));
const responseHelper_1 = require("../helpers/responseHelper");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            (0, responseHelper_1.sendError)(res, 'Email and password are required', 400);
            return;
        }
        // Authenticate via AuthService (MongoDB database query + bcrypt password check)
        const authResult = await authService_1.default.authenticateUser(email, password);
        if (!authResult) {
            (0, responseHelper_1.sendError)(res, 'Invalid email or password', 401);
            return;
        }
        const { user, token } = authResult;
        const userObj = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: 'SuperAdmin',
            token,
        };
        (0, responseHelper_1.sendSuccess)(res, userObj, 'Login successful');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.login = login;

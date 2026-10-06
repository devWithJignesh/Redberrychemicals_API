"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.isConnected = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.isConnected = false;
const connectDB = async () => {
    if (mongoose_1.default.connection.readyState >= 1) {
        exports.isConnected = true;
        return true;
    }
    const mongoURI = process.env.MONGO_URI ||
        'mongodb+srv://Vercel-Admin-redberryAPI:tjRRUnMyJkcUfBSm@redberryapi.8wn4tvi.mongodb.net/redberry_db?retryWrites=true&w=majority';
    try {
        const conn = await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 8000,
        });
        exports.isConnected = true;
        console.log(`\x1b[32m✔ MongoDB Connected Successfully!\x1b[0m Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
        return true;
    }
    catch (error) {
        exports.isConnected = false;
        console.error(`\x1b[31m✖ MongoDB Connection Error:\x1b[0m`, error.message);
        return false;
    }
};
exports.connectDB = connectDB;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.isConnected = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.isConnected = false;
const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/redberry_db';
    try {
        const conn = await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
        });
        exports.isConnected = true;
        console.log(`\x1b[32m✔ MongoDB Connected Successfully!\x1b[0m Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
        return true;
    }
    catch (error) {
        exports.isConnected = false;
        console.error(`\x1b[31m✖ MongoDB Connection Error:\x1b[0m`, error.message);
        console.log(`\x1b[33mℹ Make sure local MongoDB server is running on mongodb://localhost:27017\x1b[0m`);
        return false;
    }
};
exports.connectDB = connectDB;

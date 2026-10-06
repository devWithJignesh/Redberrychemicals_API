"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabaseHandler = void 0;
const seedDatabase_1 = require("../helpers/seedDatabase");
const responseHelper_1 = require("../helpers/responseHelper");
const Product_1 = __importDefault(require("../models/Product"));
const SubProduct_1 = __importDefault(require("../models/SubProduct"));
const seedDatabaseHandler = async (req, res) => {
    try {
        const { force } = req.query;
        if (force === 'true') {
            await Product_1.default.deleteMany({});
            await SubProduct_1.default.deleteMany({});
        }
        await (0, seedDatabase_1.seedDatabase)();
        (0, responseHelper_1.sendSuccess)(res, null, 'Database seeded successfully');
    }
    catch (error) {
        (0, responseHelper_1.sendError)(res, error.message, 500);
    }
};
exports.seedDatabaseHandler = seedDatabaseHandler;

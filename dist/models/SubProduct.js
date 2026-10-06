"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const SubProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, index: true },
    productId: {
        type: mongoose_1.Schema.Types.Mixed,
        ref: 'Product',
        required: false,
        index: true
    },
    parentProductId: { type: String, default: '', index: true },
    parentProductName: { type: String, default: 'Agro Chemicals' },
    dosage: { type: String, default: '' },
    packagingSizes: { type: [String], default: ['100 gm', '250 gm', '500 gm', '1 Kg'] },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '/images/products/premium_dummy.jpg' },
    images: { type: [String], default: [] },
    status: { type: String, enum: ['Active', 'Draft', 'Archived'], default: 'Active', index: true },
}, { timestamps: true });
// Indexes for fast relation population & lookups
SubProductSchema.index({ productId: 1, status: 1 });
SubProductSchema.index({ parentProductId: 1, status: 1 });
SubProductSchema.index({ name: 'text', shortDescription: 'text' });
exports.default = mongoose_1.default.model('SubProduct', SubProductSchema);

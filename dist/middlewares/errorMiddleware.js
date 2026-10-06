"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorMiddleware = (err, req, res, next) => {
    console.error('\x1b[31mUnhandled Error:\x1b[0m', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
};
exports.errorMiddleware = errorMiddleware;

import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('\x1b[31mUnhandled Error:\x1b[0m', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

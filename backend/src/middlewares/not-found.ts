import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

export function notFound(req: Request, res: Response, next: NextFunction): void {
  const error: CustomError = new Error(`Route Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export default notFound;

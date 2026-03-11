import type { Request, Response, NextFunction } from 'express';

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findMany(filter?: Record<string, unknown>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface IService<T> {
  getById(id: string): Promise<T | null>;
  getAll(filter?: Record<string, unknown>): Promise<T[]>;
}

export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

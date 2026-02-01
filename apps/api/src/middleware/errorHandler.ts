import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err)

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: 'A record with this information already exists',
        code: 'DUPLICATE_ENTRY',
      })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        message: 'Record not found',
        code: 'NOT_FOUND',
      })
    }
    return res.status(500).json({
      message: 'Database error',
      code: err.code,
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    })
  }

  // Default error response
  const statusCode = err.statusCode || 500
  const message = err.isOperational ? err.message : 'Internal server error'

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export const createError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.isOperational = true
  return error
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

import { StatusCodes } from "http-status-codes"

export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, StatusCodes.BAD_REQUEST)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized: User not authenticated") {
    super(message, StatusCodes.UNAUTHORIZED)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden: User does not have access") {
    super(message, StatusCodes.FORBIDDEN)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, StatusCodes.NOT_FOUND)
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, StatusCodes.CONFLICT)
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, false)
  }
}

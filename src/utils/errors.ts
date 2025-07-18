import { StatusCodes } from "http-status-codes"

/**
 * @swagger
 * components:
 *   schemas:
 *     AppError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: The error message
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *         isOperational:
 *           type: boolean
 *           description: Whether the error is operational
 */
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

/**
 * @swagger
 * components:
 *   schemas:
 *     IErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: The error message
 *         statusCode:
 *           type: integer
 *           description: HTTP status code
 *       required:
 *         - error
 *         - statusCode
 *       example:
 *         error: "An error occurred"
 *         statusCode: 500
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BadRequestError:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorResponse'
 *       example:
 *         error: "Bad request"
 *         statusCode: 400
 */
export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, StatusCodes.BAD_REQUEST)
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     UnauthorizedError:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorResponse'
 *       example:
 *         error: "Unauthorized: User not authenticated"
 *         statusCode: 401
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized: User not authenticated") {
    super(message, StatusCodes.UNAUTHORIZED)
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ForbiddenError:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorResponse'
 *       example:
 *         error: "Forbidden: User does not have access"
 *         statusCode: 403
 */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden: User does not have access") {
    super(message, StatusCodes.FORBIDDEN)
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     NotFoundError:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorResponse'
 *       example:
 *         error: "Resource not found"
 *         statusCode: 404
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, StatusCodes.NOT_FOUND)
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ConflictError:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *       example:
 *         error: "Resource already exists"
 *         statusCode: 409
 */
export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, StatusCodes.CONFLICT)
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     InternalServerError:
 *       allOf:
 *         - $ref: '#/components/schemas/IErrorResponse'
 *       example:
 *         error: "Internal server error"
 *         statusCode: 500
 */
export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, false)
  }
}

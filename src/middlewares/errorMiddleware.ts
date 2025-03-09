import { Request, Response, NextFunction } from "express"
import { AppError } from "../utils/errors"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { FirebaseError } from "firebase-admin"

// For development environment - include stack trace
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: "error",
    message: err.message,
    stack: err.stack,
    error: err,
  })
}

// For production environment - clean error response
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted errors: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    })
  }
  // Programming or unknown errors: don't leak error details
  else {
    // Log error for developers
    console.error("ERROR 💥", err)

    // Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    })
  }
}

// Handle Prisma specific errors
const handlePrismaErrors = (err: PrismaClientKnownRequestError): AppError => {
  // Handle unique constraint violations
  if (err.code === "P2002") {
    const field = (err.meta?.target as string[]) || ["field"]
    return new AppError(
      `Duplicate field value: ${field.join(", ")}. Please use another value.`,
      409
    )
  }

  // Handle record not found
  if (err.code === "P2025") {
    return new AppError("Record not found", 404)
  }

  // Handle foreign key constraint failures
  if (err.code === "P2003") {
    return new AppError("Related record not found", 400)
  }

  return new AppError("Database error", 500)
}

// Handle Firebase specific errors
const handleFirebaseErrors = (err: FirebaseError): AppError => {
  switch (err.code) {
    case "auth/id-token-expired":
      return new AppError("Your token has expired. Please login again.", 401)
    case "auth/id-token-revoked":
      return new AppError(
        "Your session has been revoked. Please login again.",
        401
      )
    case "auth/invalid-id-token":
      return new AppError("Invalid authentication token", 401)
    default:
      return new AppError("Authentication error", 401)
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error =
    err instanceof AppError
      ? err
      : new AppError(err.message || "Something went wrong", 500, false)

  // Handle specific error types
  if (err instanceof PrismaClientKnownRequestError) {
    error = handlePrismaErrors(err)
  } else if (
    "code" in err &&
    typeof (err as any).code === "string" &&
    (err as any).code.startsWith("auth/")
  ) {
    error = handleFirebaseErrors(err as unknown as FirebaseError)
  }

  // Send different error responses based on environment
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res)
  } else {
    sendErrorProd(error, res)
  }
}

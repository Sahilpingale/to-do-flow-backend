import admin from "firebase-admin"
import { Response, NextFunction } from "express"
import { Request } from "../types/authTypes"
import { UnauthorizedError } from "../utils/errors"
import { asyncHandler } from "../utils/asyncHandler"

console.log("firebase", process.env.FIREBASE_PROJECT_ID)
console.log("firebase", process.env.FIREBASE_CLIENT_EMAIL)
console.log("firebase", process.env.FIREBASE_PRIVATE_KEY)

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
  console.log("Firebase Admin initialized successfully")
} catch (error) {
  console.error("Error initializing Firebase Admin:", error)
}

export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Extract token from header
    const authHeader = req.headers.authorization
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ") ||
      !authHeader.split("Bearer ")[1]
    ) {
      throw new UnauthorizedError("No token provided")
    }

    const token = authHeader.split("Bearer ")[1]

    // 2. Verify token with Firebase Admin
    try {
      const decodedToken = await admin.auth().verifyIdToken(token)

      if (!decodedToken) {
        throw new UnauthorizedError("Invalid token")
      }

      // 3. Set user information on request object
      req.user = decodedToken
      next()
    } catch (error) {
      throw new UnauthorizedError("Invalid token")
    }
  }
)

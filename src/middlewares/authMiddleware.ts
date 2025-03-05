import admin from "firebase-admin"
import prisma from "../lib/prisma"
import { Response, NextFunction } from "express"
import { Request } from "../types/authTypes"

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

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Extract token from header
  const authHeader = req.headers.authorization
  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ") ||
    !authHeader.split("Bearer ")[1]
  ) {
    res.status(401).json({ error: "Unauthorized: No token provided" })
    return
  }

  const token = authHeader.split("Bearer ")[1]

  // 3. Verify token with admin
  try {
    const decodedToken = await admin.auth().verifyIdToken(token)

    if (!decodedToken) {
      res.status(401).json({ error: "Unauthorized: Invalid token" })
      return
    }

    req.user = decodedToken

    next()
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid token" })
    return
  }
}

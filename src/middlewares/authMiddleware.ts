import { NextFunction, Request, Response } from "express"
import admin from "firebase-admin"

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
): Promise<void> => {
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

    next()
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid token" })
    return
  }
}

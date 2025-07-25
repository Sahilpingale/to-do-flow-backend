import prisma from "../lib/prisma"
import { ILoginRequest } from "../controllers/controller.auth"
import { ConflictError, UnauthorizedError } from "../utils/errors"

export const userLogin = async ({
  email,
  displayName,
  photoURL,
  phoneNumber,
  uid,
  refreshToken,
  accessToken,
}: ILoginRequest) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })
  if (user) {
    return {
      user,
      refreshToken,
      accessToken,
    }
  }
  const newUser = await prisma.user.create({
    data: {
      email,
      displayName,
      photoURL,
      phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: uid,
    },
  })
  return {
    user: newUser,
    refreshToken,
    accessToken,
  }
}

export const refreshToken = async (refreshToken: string) => {
  try {
    // Firebase Admin SDK doesn't directly support refresh token verification
    // We need to use Firebase Auth REST API to exchange a refresh token for a new ID token

    // Make sure you have FIREBASE_API_KEY in your environment variables
    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      }
    )

    const data = await response.json()

    if (data.error) {
      console.error("Firebase refresh token error:", data.error)
      throw new UnauthorizedError(data.error.message || "Invalid refresh token") // This is a 401 error. Would this cause the system to go into an infinite loop?
    }

    return {
      accessToken: data.id_token,
      refreshToken: data.refresh_token,
    }
  } catch (error) {
    console.error("Refresh token error:", error)
    throw new UnauthorizedError("Invalid or expired refresh token") // This is a 401 error. Would this cause the system to go into an infinite loop?
  }
}

import { Request, Response, NextFunction } from "express"
import * as authService from "../services/services.auth"
import { UnauthorizedError } from "../utils/errors"

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: User's email address
 *         displayName:
 *           type: string
 *           description: User's display name
 *         photoURL:
 *           type: string
 *           description: URL to user's profile photo
 *         phoneNumber:
 *           type: string
 *           description: User's phone number
 *         uid:
 *           type: string
 *           description: User's unique identifier
 *       required:
 *         - email
 *         - displayName
 *         - uid
 *       example:
 *         email: "user@example.com"
 *         displayName: "John Doe"
 *         photoURL: "https://example.com/photo.jpg"
 *         phoneNumber: "+1234567890"
 *         uid: "user123"
 */
export interface ILoginRequest {
  email: string
  displayName: string
  photoURL?: string
  phoneNumber?: string
  uid: string
}

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: User's ID in the system
 *         email:
 *           type: string
 *           description: User's email address
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Account last update timestamp
 *       required:
 *         - id
 *         - email
 *         - createdAt
 *         - updatedAt
 *       example:
 *         id: "12345"
 *         email: "user@example.com"
 *         createdAt: "2023-01-01T00:00:00.000Z"
 *         updatedAt: "2023-01-01T00:00:00.000Z"
 */
interface ILoginResponse {
  id: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export type LoginRequest = Request<{}, {}, ILoginRequest>
export type LoginResponse = Response<ILoginResponse | { error: string }>

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login or register a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       201:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const login = async (req: LoginRequest, res: LoginResponse) => {
  try {
    const { email, displayName, photoURL, phoneNumber, uid } = req.body
    const user = await authService.userLogin({
      email,
      displayName,
      photoURL,
      phoneNumber,
      uid,
    })
    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token using refresh token from HTTP-only cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully refreshed token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New access token
 *       401:
 *         description: Invalid or expired refresh token
 */
export const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const refreshToken = req.cookies.refreshToken

    // if (!refreshToken) {
    //   throw new UnauthorizedError("Refresh token not found")
    // }

    const refreshToken =
      "AMf-vBx1gdFVCyajslGDZkUBAVYH-PS6yZ48zgVZvsdTG3FcFjxL-EyANjOTs-yfvDcoWDFBs7SJd3HHe8KqpAE54ifQbLrlH_YyxWR-RZkOdeIZUzAAh2to0S3Zf4_NO6fJYtnUl3PRXKJEeX1NBb0rxo8zc5iY31WrIpu4lDokq-vxfJisj2FltTAt5pRAyWJzs21eiLur9abjAHb8lC90kVsE4m-6knY8sAC5iyghk4CCIxxfyjCutaeyeCtTQnEZ49Ywc17C1a44ZbuHkLgS9bn0ts3Y14TVC2fcEcHKrcpjPcgqXMyq8LIRt16eeyhuvI7AdmHC2wtV7xyU2Xih8uoU4zJraVmfY0Xnj03pXQlXzMSBTxYt9UNwzBmpW4oD_2HWmLOV3DOMra8JVHxiAS9848LOfr-HmUjuLANRWY7bkvLG5HI"

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshToken(refreshToken)

    // If a new refresh token was issued, update the cookie
    if (newRefreshToken) {
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
    }

    // Return the new access token to the client
    res.status(200).json({ accessToken, refreshToken: newRefreshToken })
  } catch (error) {
    next(error)
  }
}

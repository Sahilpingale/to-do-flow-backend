import { Request, Response } from "express"
import * as authService from "../services/services.auth"

export interface SignUpRequest {
  email: string
  displayName: string
  photoURL?: string
  phoneNumber?: string
  uid: string
}

interface SignUpResponse {
  id: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export const signUp = async (
  req: Request<{}, {}, SignUpRequest>,
  res: Response<SignUpResponse | { error: string }>
) => {
  try {
    const { email, displayName, photoURL, phoneNumber, uid } = req.body
    const user = await authService.signUpNewUser({
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

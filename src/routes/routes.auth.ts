import express from "express"
import * as authController from "../controllers/controller.auth"

const authRoutes = express.Router()

authRoutes.post("/login", authController.login)
authRoutes.post("/refresh-token", authController.refreshTokenHandler)
authRoutes.post("/logout", authController.logout)

export default authRoutes

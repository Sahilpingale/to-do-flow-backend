import express from "express"
import { signUp } from "../controllers/controller.auth"

const authRoutes = express.Router()

authRoutes.post("/signup", signUp)

export default authRoutes

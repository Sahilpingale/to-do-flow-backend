import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware"

const aiRoutes = express.Router()

aiRoutes.use(authMiddleware)

aiRoutes.post("/generate-task-suggestions")

export { aiRoutes }

import express from "express"
import { authMiddleware } from "../middlewares/authMiddleware"
import { generateTaskSuggestions } from "../controllers/controller.ai"

const aiRoutes = express.Router()

aiRoutes.use(authMiddleware)

aiRoutes.post("/generate-task-suggestions", generateTaskSuggestions)

export { aiRoutes }

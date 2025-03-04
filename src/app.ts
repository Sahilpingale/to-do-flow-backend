import express from "express"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger.config"
import projectRoutes from "./routes/routes.project"
import { authMiddleware } from "./middlewares/authMiddleware"

const app = express()

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173", // Vite's default port
        "https://hoppscotch.io",
        "https://drbu5u3r8oqd3.cloudfront.net",
        process.env.FRONTEND_URL || "",
      ].filter((url) => url !== "")

      if (origin?.startsWith("chrome-extension://")) {
        callback(null, true)
        return
      }

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Enable if you're using cookies/authentication
  })
)

app.use(express.json())
// Unprotected routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Protected routes
app.use("/projects", authMiddleware, projectRoutes)

export default app

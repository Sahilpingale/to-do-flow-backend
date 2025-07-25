import express from "express"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger.config"
import { projectRoutes } from "./routes/routes.project"
import { authRoutes } from "./routes/routes.auth"
import { errorHandler } from "./middlewares/errorMiddleware"
import { NotFoundError } from "./utils/errors"
import cookieParser from "cookie-parser"
import { aiRoutes } from "./routes/routes.ai"

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
app.use(cookieParser())
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use("/projects", projectRoutes)
app.use("/auth", authRoutes)
app.use("/ai", aiRoutes)

// Handle 404 errors for undefined routes
app.all("*", (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`))
})

// Global error handler - must be after all routes
app.use(errorHandler)

export default app

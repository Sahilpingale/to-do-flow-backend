import express from "express"
import cors from "cors"
import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger.config"
import projectRoutes from "./routes/routes.project"

const app = express()

// Add CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173", // Vite's default port
        "https://hoppscotch.io",
        "https://d3b2seba95oc2q.cloudfront.net",
        process.env.FRONTEND_URL || "",
      ].filter((url) => url !== "")

      console.log("Received origin:", origin)
      console.log("Allowed origins:", allowedOrigins)

      // Allow Hoppscotch Chrome extension in production temporarily
      if (
        process.env.NODE_ENV === "production" &&
        origin?.startsWith("chrome-extension://")
      ) {
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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use("/projects", projectRoutes)

export default app

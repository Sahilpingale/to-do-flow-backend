import express from "express"

import swaggerUi from "swagger-ui-express"
import { swaggerSpec } from "./config/swagger.config"
import projectRoutes from "./routes/routes.project"

const app = express()
app.use(express.json())

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use("/projects", projectRoutes)

export default app

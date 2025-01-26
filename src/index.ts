import "dotenv/config"
import express from "express"
import prisma from "./lib/prisma"
import swaggerUi from "swagger-ui-express"
import routes from "./routes/routes"
import { swaggerSpec } from "./config/swagger.config"
import { green, underline, bold } from "colorette"

const env = process.env.NODE_ENV || "development"

const app = express()
const port = process.env.PORT || 5000 // Accessing the PORT variable from .env

app.use(express.json())

// Add before your routes
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Mount the router
app.use("/api", routes)

// Example route using Prisma
app.get("/todos", async (req, res) => {
  try {
    const todos = await prisma.todo.findMany()
    res.json(todos)
  } catch (error) {
    res.status(500).json({ error: "Error fetching todos" })
  }
})

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.listen(port, () => {
  console.log(
    bold(underline(green(`Server is running at http://localhost:${port}`)))
  )
})

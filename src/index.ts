import "dotenv/config" // This loads the .env file and sets process.env variables
import express from "express"
import prisma from "./lib/prisma"

const env = process.env.NODE_ENV || "development"

const app = express()
const port = process.env.PORT || 5000 // Accessing the PORT variable from .env

app.use(express.json())

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
  console.log(`Server is running at http://localhost:${port}`)
})

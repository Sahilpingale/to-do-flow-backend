import "dotenv/config" // This loads the .env file and sets process.env variables
import express from "express"

const env = process.env.NODE_ENV || "development"

const app = express()
const port = process.env.PORT || 5000 // Accessing the PORT variable from .env

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})

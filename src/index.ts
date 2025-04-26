import "dotenv/config"
import { green } from "colorette"
import app from "./app"

const port = process.env.PORT || 5000

app.listen(port, () => {
  process.env.NODE_ENV === "production"
    ? console.log(green(`Server is running at http://localhost:${port}`))
    : console.log(
        green(`Server is running at http://localhost:${port}`),
        green(`Swagger UI is running at http://localhost:${port}/api-docs`)
      )
})

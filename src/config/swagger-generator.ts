import fs from "fs"
import { swaggerSpec } from "./swagger.config"

// Write the Swagger spec to a JSON file
fs.writeFileSync("./spec.json", JSON.stringify(swaggerSpec, null, 2), "utf-8")

console.log("Swagger spec has been generated at ./spec.json")

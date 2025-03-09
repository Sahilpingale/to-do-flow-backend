import swaggerJsDoc from "swagger-jsdoc"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Name",
      version: "1.0.0",
      description: "API Documentation",
    },
    servers: [
      {
        url: process.env.BACKEND_URL || "",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Specify paths to your route files for annotations
}

export const swaggerSpec = swaggerJsDoc(options)

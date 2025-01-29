import express from "express"
import {
  createProject,
  editProject,
  getProjectById,
  getProjects,
} from "../controller/controller.project"

const projectRoutes = express.Router()

projectRoutes.post("/", createProject)
projectRoutes.get("/", getProjects)
projectRoutes.get("/:id", getProjectById)
projectRoutes.patch("/:id", editProject)

export default projectRoutes

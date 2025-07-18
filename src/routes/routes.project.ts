import express from "express"
import {
  createNewProject,
  updateProjectDetails,
  fetchProjectById,
  fetchAllProjects,
  deleteProject,
} from "../controllers/controller.project"
import { authMiddleware } from "../middlewares/authMiddleware"

const projectRoutes = express.Router()

projectRoutes.use(authMiddleware)

projectRoutes.post("/", createNewProject)
projectRoutes.get("/", fetchAllProjects)
projectRoutes.get("/:id", fetchProjectById)
projectRoutes.patch("/:id", updateProjectDetails)
projectRoutes.delete("/:id", deleteProject)

export { projectRoutes }

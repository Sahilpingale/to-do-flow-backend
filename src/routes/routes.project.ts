import express from "express"
import {
  createNewProject,
  updateProjectDetails,
  fetchProjectById,
  fetchAllProjects,
  deleteProject,
} from "../controllers/controller.project"

const projectRoutes = express.Router()

projectRoutes.post("/", createNewProject)
projectRoutes.get("/", fetchAllProjects)
projectRoutes.get("/:id", fetchProjectById)
projectRoutes.patch("/:id", updateProjectDetails)
projectRoutes.delete("/:id", deleteProject)

export default projectRoutes

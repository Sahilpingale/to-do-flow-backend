import { Request, Response, RequestHandler } from "express"
import * as projectService from "../services.project"

export const createProject = async (req: Request, res: Response) => {
  try {
    const project = await projectService.createProject(req.body)
    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}

export const getProjects: RequestHandler = async (req, res) => {
  try {
    const projects = await projectService.getProjects()
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}

export const getProjectById: RequestHandler = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id)
    if (!project) {
      return void res.status(404).json({ error: "Project not found" })
    }
    res.json(project)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}

export const editProject: RequestHandler = async (req, res) => {
  try {
    const updatedProject = await projectService.editProject(
      req.params.id,
      req.body
    )
    if (!updatedProject) {
      return void res.status(404).json({ error: "Project not found" })
    }
    res.json(updatedProject)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}

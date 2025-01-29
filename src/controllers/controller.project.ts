import { Request, Response, RequestHandler } from "express"
import * as projectService from "../services/services.project"

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     description: Creates a new project with the given name.
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the project
 *     responses:
 *       201:
 *         description: Project created successfully
 *       500:
 *         description: Internal server error
 */
export const createProject = async (req: Request, res: Response) => {
  try {
    const project = await projectService.createProject(req.body)
    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     description: Retrieves a list of all projects with their associated nodes and edges.
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: A list of projects
 *       500:
 *         description: Internal server error
 */
export const getProjects: RequestHandler = async (req, res) => {
  try {
    const projects = await projectService.getProjects()
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     description: Retrieves a project with its nodes and edges by ID.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Edit a project
 *     description: Updates the project's nodes and edges.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nodesToUpdate:
 *                 type: array
 *                 items:
 *                   type: object
 *               nodesToAdd:
 *                 type: array
 *                 items:
 *                   type: object
 *               nodesToRemove:
 *                 type: array
 *                 items:
 *                   type: object
 *               edgesToAdd:
 *                 type: array
 *                 items:
 *                   type: object
 *               edgesToRemove:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
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

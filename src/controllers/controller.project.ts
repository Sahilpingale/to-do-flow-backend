import { Request, Response, RequestHandler } from "express"
import * as projectService from "../services/services.project"

/**
 * @swagger
 * components:
 *   schemas:
 *     NodeType:
 *       type: string
 *       enum: [TASK]
 *     TaskStatus:
 *       type: string
 *       enum: [TODO, IN_PROGRESS, DONE]
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the project
 *         name:
 *           type: string
 *           description: Name of the project
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         nodes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskNode'
 *         edges:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskEdge'
 *     TaskNode:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             status:
 *               $ref: '#/components/schemas/TaskStatus'
 *         position:
 *           type: object
 *           properties:
 *             x:
 *               type: number
 *             y:
 *               type: number
 *         type:
 *           $ref: '#/components/schemas/NodeType'
 *     TaskEdge:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         source:
 *           type: string
 *         target:
 *           type: string
 *         type:
 *           $ref: '#/components/schemas/NodeType'
 *         animated:
 *           type: boolean
 *         deletable:
 *           type: boolean
 *         reconnectable:
 *           type: boolean
 */

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       500:
 *         description: Internal server error
 */
export const createNewProject = async (req: Request, res: Response) => {
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       500:
 *         description: Internal server error
 */
export const fetchAllProjects: RequestHandler = async (req, res) => {
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
export const fetchProjectById: RequestHandler = async (req, res) => {
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
 *     description: Updates a project's nodes and edges.
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
 *                   properties:
 *                     id:
 *                       type: string
 *                     data:
 *                       type: object
 *                     position:
 *                       type: object
 *                     type:
 *                       type: string
 *               nodesToAdd:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     data:
 *                       type: object
 *                     position:
 *                       type: object
 *                     type:
 *                       type: string
 *               nodesToRemove:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *               edgesToAdd:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     source:
 *                       type: string
 *                     target:
 *                       type: string
 *               edgesToRemove:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
export const updateProjectDetails: RequestHandler = async (req, res) => {
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

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     description: Deletes a project by ID.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Project deleted successfully
 *       500:
 *         description: Internal server error
 *       404:
 *         description: Project not found
 */
export const deleteProject = async (req: Request, res: Response) => {
  try {
    await projectService.deleteProject(req.params.id)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
}

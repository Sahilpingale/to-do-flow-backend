import { Response } from "express"
import * as projectService from "../services/services.project"
import { Request } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { NotFoundError, UnauthorizedError } from "../utils/errors"
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
 *     CreateProjectRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the project
 *       required:
 *         - name
 *       example:
 *         name: "My New Project"
 *
 *     ProjectResponse:
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
 *
 *     UpdateProjectRequest:
 *       type: object
 *       properties:
 *         nodesToUpdate:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskNode'
 *         nodesToAdd:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskNode'
 *         nodesToRemove:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *         edgesToAdd:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TaskEdge'
 *         edgesToRemove:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 */

// Define interface types for requests and responses
export interface ICreateProjectRequest {
  name: string
}

export interface IUpdateProjectRequest {
  nodesToUpdate?: any[]
  nodesToAdd?: any[]
  nodesToRemove?: any[]
  edgesToAdd?: any[]
  edgesToRemove?: any[]
}

// Define request and response types
export type CreateProjectRequest = Request<{}, {}, ICreateProjectRequest>
export type ProjectResponse = Response<any>
export type ProjectsResponse = Response<any[]>
export type UpdateProjectRequest = Request<
  { id: string },
  any,
  IUpdateProjectRequest
>

// Add this interface to extend the Express Request
interface AuthenticatedRequest extends Request {
  user?: {
    uid: string
    [key: string]: any
  }
}

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
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
export const createNewProject = asyncHandler(
  async (
    req: CreateProjectRequest & AuthenticatedRequest,
    res: ProjectResponse
  ) => {
    if (!req.user || !req.user.uid) {
      throw new UnauthorizedError()
    }

    const project = await projectService.createProject({
      name: req.body.name,
      userId: req.user.uid,
    })

    res.status(201).json(project)
  }
)

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     description: Retrieves a list of all projects for the authenticated user.
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: A list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectResponse'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
export const fetchAllProjects = asyncHandler(
  async (req: AuthenticatedRequest, res: ProjectsResponse) => {
    const projects = await projectService.getProjects(req.user?.uid || "")
    res.json(projects)
  }
)

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
 *               $ref: '#/components/schemas/ProjectResponse'
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
export const fetchProjectById = asyncHandler(
  async (req: AuthenticatedRequest, res: ProjectResponse) => {
    const project = await projectService.getProjectById(
      req.params.id,
      req.user?.uid || ""
    )

    if (!project) {
      throw new NotFoundError("Project not found")
    }

    res.json(project)
  }
)

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
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
export const updateProjectDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const projectId = req.params.id
    const updateData = req.body as IUpdateProjectRequest

    const updatedProject = await projectService.editProject(
      projectId,
      updateData
    )

    if (!updatedProject) {
      throw new NotFoundError("Project not found")
    }

    res.json(updatedProject)
  }
)

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
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
export const deleteProject = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || !req.user.uid) {
      throw new UnauthorizedError()
    }
    await projectService.deleteProject(req.params.id, req.user.uid)
    res.status(204).send()
  }
)

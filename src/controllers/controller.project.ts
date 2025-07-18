import { Response } from "express"
import * as projectService from "../services/services.project"
import { Request } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { NotFoundError, UnauthorizedError } from "../utils/errors"
import {
  ICreateProjectRequest,
  IUpdateProjectRequest,
  IProjectResponse,
  IProjectListResponse,
  AuthenticatedUser,
} from "../models/models"
/**
 * @swagger
 * components:
 *   schemas:
 *     INodeType:
 *       type: string
 *       enum: [TASK]
 *
 *     ITaskStatus:
 *       type: string
 *       enum: [TODO, IN_PROGRESS, DONE]
 *
 *     IProject:
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
 *             $ref: '#/components/schemas/ITaskNode'
 *         edges:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ITaskEdge'
 *
 *     ITaskNode:
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
 *               $ref: '#/components/schemas/ITaskStatus'
 *         position:
 *           type: object
 *           properties:
 *             x:
 *               type: number
 *             y:
 *               type: number
 *         type:
 *           $ref: '#/components/schemas/INodeType'
 *
 *     ITaskEdge:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         source:
 *           type: string
 *         target:
 *           type: string
 *         type:
 *           $ref: '#/components/schemas/INodeType'
 *         animated:
 *           type: boolean
 *         deletable:
 *           type: boolean
 *         reconnectable:
 *           type: boolean
 *
 *     ICreateProjectRequest:
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
 *     IProjectResponse:
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
 *             $ref: '#/components/schemas/ITaskNode'
 *         edges:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ITaskEdge'
 *
 *     IUpdateProjectRequest:
 *       type: object
 *       properties:
 *         nodesToUpdate:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ITaskNode'
 *         name:
 *           type: string
 *         nodesToAdd:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ITaskNode'
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
 *             $ref: '#/components/schemas/ITaskEdge'
 *         edgesToRemove:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 */

export type CreateProjectRequest = Request<
  {},
  IProjectResponse,
  ICreateProjectRequest
>
export type ProjectResponse = Response<IProjectResponse>
export type ProjectsResponseType = Response<IProjectListResponse>
export type UpdateProjectRequest = Request<
  { id: string },
  IProjectResponse,
  IUpdateProjectRequest
>

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser
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
 *             $ref: '#/components/schemas/ICreateProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IProjectResponse'
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
 *                 $ref: '#/components/schemas/IProjectResponse'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Internal server error
 */
export const fetchAllProjects = asyncHandler(
  async (req: AuthenticatedRequest, res: ProjectsResponseType) => {
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
 *               $ref: '#/components/schemas/IProjectResponse'
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
 *             $ref: '#/components/schemas/IUpdateProjectRequest'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IProjectResponse'
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

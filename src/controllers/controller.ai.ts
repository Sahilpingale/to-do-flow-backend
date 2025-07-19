import { Request, Response } from "express"
import {
  IGenerateTaskSuggestionsRequest,
  AuthenticatedRequest,
  IGenerateTaskSuggestionsResponse,
} from "../models/models"
import { asyncHandler } from "../utils/asyncHandler"
import { UnauthorizedError } from "../utils/errors"
import * as aiService from "../services/services.ai"

/**
 * @swagger
 * components:
 *   schemas:
 *     IGenerateTaskSuggestionsRequest:
 *       type: object
 *       properties:
 *         projectId:
 *           type: string
 *           description: The ID of the project to generate suggestions for
 *         query:
 *           type: string
 *           description: Natural language query describing the desired tasks
 *         associatedNodes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ITaskNode'
 *           description: Array of existing task nodes that should be considered when generating suggestions
 *       required:
 *         - projectId
 *         - query
 *         - associatedNodes
 *       example:
 *         projectId: "123e4567-e89b-12d3-a456-426614174000"
 *         query: "Create tasks for setting up a CI/CD pipeline"
 *         associatedNodes: []
 *
 *     IGenerateTaskSuggestionsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful
 *         suggestions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ITaskNode'
 *           description: Array of suggested task nodes
 *         message:
 *           type: string
 *           description: Optional message about the generation process
 *       required:
 *         - success
 *       example:
 *         success: true
 *         suggestions: []
 *         message: "Generated 3 task suggestions based on your query"
 */

export type GenerateTaskSuggestionsRequest = Request<
  {},
  IGenerateTaskSuggestionsResponse,
  IGenerateTaskSuggestionsRequest
>

export type GenerateTaskSuggestionsResponse =
  Response<IGenerateTaskSuggestionsResponse>

/**
 * @swagger
 * /ai/generate-task-suggestions:
 *   post:
 *     summary: Generate AI-powered task suggestions
 *     description: Uses AI to generate task suggestions based on a natural language query and existing project context.
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IGenerateTaskSuggestionsRequest'
 *     responses:
 *       200:
 *         description: Task suggestions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IGenerateTaskSuggestionsResponse'
 *       400:
 *         description: Bad request - Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IErrorResponse'
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IErrorResponse'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IErrorResponse'
 *       500:
 *         description: Internal server error or AI service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IErrorResponse'
 */
export const generateTaskSuggestions = asyncHandler(
  async (req: AuthenticatedRequest, res: GenerateTaskSuggestionsResponse) => {
    if (!req.user || !req.user.uid) {
      throw new UnauthorizedError()
    }

    const { projectId, query, associatedNodes } = req.body

    const response = await aiService.generateTaskSuggestions(
      projectId,
      query,
      associatedNodes
    )

    res.json(response)
  }
)

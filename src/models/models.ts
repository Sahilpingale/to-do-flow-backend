import { NodeType, TaskNode, TaskStatus } from "@prisma/client"
import { Request as ExpressRequest } from "express"

export interface IProject {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  nodes: ITaskNode[]
  edges: ITaskEdge[]
}

export interface ITaskEdge {
  id: string
  source: string
  target: string
  type: NodeType
  animated: boolean
  deletable: boolean
  reconnectable: boolean
}

export interface ITaskNode {
  id: string
  data: {
    title: string
    description: string
    status: TaskStatus
  }
  position: {
    x: number
    y: number
  }
  type: NodeType
}

export interface ICreateProjectRequest {
  name: string
}

export interface IUpdateProjectRequest {
  name?: string
  nodesToUpdate?: ITaskNode[]
  nodesToAdd?: ITaskNode[]
  nodesToRemove?: Pick<ITaskNode, "id">[]
  edgesToAdd?: ITaskEdge[]
  edgesToRemove?: Pick<ITaskEdge, "id">[]
}

export interface IGenerateTaskSuggestionsRequest {
  projectId: string
  query: string
  associatedNodes: ITaskNode[]
}

export interface IGenerateTaskSuggestionsResponse {
  success: boolean
  suggestions?: ITaskNode[]
  message?: string
}

export interface IProjectResponse extends IProject {}

export interface IProjectListResponse extends Array<IProject> {}

export interface AuthenticatedUser {
  uid: string
  [key: string]: string | number | boolean | undefined
}

export interface AuthenticatedRequest extends ExpressRequest {
  user?: AuthenticatedUser
}

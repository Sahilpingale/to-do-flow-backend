import { NodeType, TaskStatus } from "@prisma/client"

export interface IProject {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  nodes: TaskNode[]
  edges: TaskEdge[]
}

export interface TaskEdge {
  id: string
  source: string
  target: string
  type: NodeType
  animated: boolean
  deletable: boolean
  reconnectable: boolean
}

export interface TaskNode {
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
  nodesToUpdate?: TaskNode[]
  nodesToAdd?: TaskNode[]
  nodesToRemove?: Pick<TaskNode, "id">[]
  edgesToAdd?: TaskEdge[]
  edgesToRemove?: Pick<TaskEdge, "id">[]
}

export interface IGenerateTaskSuggestionsRequest {
  projectId: string
  query: string
  associatedNodes: TaskNode[]
}

export interface IProjectResponse extends IProject {}

export interface IProjectListResponse extends Array<IProject> {}

export interface AuthenticatedUser {
  uid: string
  [key: string]: string | number | boolean | undefined
}

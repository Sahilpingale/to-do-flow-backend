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

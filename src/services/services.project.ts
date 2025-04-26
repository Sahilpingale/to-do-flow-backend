import { PrismaClient, TaskEdge } from "@prisma/client"
import { NodeType } from "@prisma/client"
import { IProject, TaskNode } from "../models/models"
import { NotFoundError, ConflictError } from "../utils/errors"

const prisma = new PrismaClient()

export const createProject = async (data: { name: string; userId: string }) => {
  return prisma.project.create({
    data: {
      name: data.name,
      user: {
        connect: {
          id: data.userId,
        },
      },
    },
    include: {
      nodes: true,
      edges: true,
    },
  })
}

export const getProjects = async (userId: string) => {
  return prisma.project.findMany({
    where: {
      userId,
    },
    include: {
      nodes: true,
      edges: true,
    },
  })
}

export const getProjectById = async (
  id: string,
  userId: string
): Promise<IProject | null> => {
  const project = await prisma.project.findUnique({
    where: { id, userId },
    include: {
      nodes: true,
      edges: true,
    },
  })
  if (!project) {
    return null
  }
  const modifiedProjectStructure: IProject = {
    id: project?.id!,
    name: project?.name!,
    createdAt: project?.createdAt!,
    updatedAt: project?.updatedAt!,
    nodes:
      project?.nodes.map((node) => ({
        id: node.id,
        data: {
          title: node.title,
          description: node.description,
          status: node.status,
        },
        position: {
          x: node.positionX,
          y: node.positionY,
        },
        type: node.type,
      })) ?? [],
    edges:
      project?.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        animated: edge.animated,
        deletable: edge.deletable,
        reconnectable: edge.reconnectable,
      })) ?? [],
  }
  return modifiedProjectStructure
}

export const editProject = async (
  id: string,
  data: {
    name?: string
    nodesToUpdate?: Pick<TaskNode, "data" | "position" | "id" | "type">[]
    nodesToAdd?: Pick<TaskNode, "data" | "position" | "id" | "type">[]
    nodesToRemove?: Pick<TaskNode, "id">[]
    edgesToAdd?: Pick<TaskEdge, "source" | "target" | "id">[]
    edgesToRemove?: Pick<TaskEdge, "id">[]
  }
) => {
  const project = await prisma.project.findUnique({
    where: { id },
  })

  if (!project) {
    throw new NotFoundError("Project not found")
  }

  const nodesToUpdate =
    data.nodesToUpdate && data.nodesToUpdate.length > 0
      ? data.nodesToUpdate.map((node) => {
          return {
            where: { id: node.id },
            data: {
              title: node.data.title,
              description: node.data.description,
              status: node.data.status,
              positionX: node.position.x,
              positionY: node.position.y,
              type: node.type,
            },
          }
        })
      : []

  const nodesToAdd =
    data.nodesToAdd && data.nodesToAdd.length > 0
      ? data.nodesToAdd.map((node) => ({
          where: { id: node.id },
          create: {
            id: node.id,
            title: node.data.title,
            description: node.data.description,
            status: node.data.status,
            positionX: node.position.x,
            positionY: node.position.y,
            type: node.type,
          },
          update: {
            title: node.data.title,
            description: node.data.description,
            status: node.data.status,
            positionX: node.position.x,
            positionY: node.position.y,
            type: node.type,
          },
        }))
      : []

  const nodesToRemove =
    data.nodesToRemove && data.nodesToRemove.length > 0
      ? await Promise.all(
          data.nodesToRemove.map(async (node) => {
            // Verify node exists and belongs to project
            const existingNode = await prisma.taskNode.findFirst({
              where: {
                id: node.id,
                projectId: id,
              },
            })
            if (!existingNode) {
              throw new Error(`Node ${node.id} not found in project ${id}`)
            }
            return { id: node.id }
          })
        )
      : []

  const edgesToAdd =
    data.edgesToAdd && data.edgesToAdd.length > 0
      ? await Promise.all(
          data.edgesToAdd.map(async (edge) => {
            // Verify if edge already exists for a Project and source and target
            const existingEdge = await prisma.taskEdge.findFirst({
              where: {
                source: edge.source,
                target: edge.target,
              },
            })

            if (existingEdge) {
              throw new ConflictError(
                `Edge already exists between source ${edge.source} and target ${edge.target}`
              )
            }

            return {
              where: { id: edge.id },
              create: {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: NodeType.TASK,
                animated: false,
                deletable: true,
                reconnectable: true,
              },
              update: {
                source: edge.source,
                target: edge.target,
              },
            }
          })
        )
      : []

  const edgesToRemove =
    data.edgesToRemove && data.edgesToRemove.length > 0
      ? await Promise.all(
          data.edgesToRemove.map(async (edge) => {
            // verify edge exits and belongs to a project
            const edgeNode = await prisma.taskEdge.findFirst({
              where: { id: edge.id, projectId: id },
            })
            if (!edgeNode) {
              throw new Error(`Edge ${edge.id} not found in project ${id}`)
            }
            return {
              id: edge.id,
            }
          })
        )
      : []

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      name: data.name,
      edges: {
        upsert: edgesToAdd,
        delete: edgesToRemove,
      },
      nodes: {
        upsert: nodesToAdd,
        update: nodesToUpdate,
        delete: nodesToRemove,
      },
    },
    select: {
      id: true,
      name: true,
      edges: true,
      nodes: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return updatedProject
}

export const deleteProject = async (id: string, userId: string) => {
  await prisma.taskNode.deleteMany({
    where: { projectId: id },
  })
  await prisma.taskEdge.deleteMany({
    where: { projectId: id },
  })

  return prisma.project.delete({
    where: { id, userId },
  })
}

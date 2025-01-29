import { PrismaClient } from "@prisma/client"
import { TaskStatus, TaskNodeType } from "@prisma/client"

const prisma = new PrismaClient()

export const createProject = async (data: { name: string }) => {
  return prisma.project.create({
    data,
  })
}

export const getProjects = async () => {
  return prisma.project.findMany({
    include: {
      nodes: true,
      edges: true,
    },
  })
}

export const getProjectById = async (id: string) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      nodes: true,
      edges: true,
    },
  })
}

interface Node {
  id: string
  data: { description: string; status: TaskStatus; title: string }
  position: { x: number; y: number }
  type: TaskNodeType
}

interface Edge {
  id: string
  source: string
  target: string
}

export const editProject = async (
  id: string,
  data: {
    nodesToUpdate?: Pick<Node, "data" | "position" | "id" | "type">[]
    nodesToAdd?: Pick<Node, "data" | "position" | "id" | "type">[]
    nodesToRemove?: Pick<Node, "id">[]
    edgesToAdd?: Pick<Edge, "source" | "target" | "id">[]
    edgesToRemove?: Pick<Edge, "id">[]
  }
) => {
  try {
    console.log("editProject", id, data)

    const project = await prisma.project.findUnique({
      where: { id },
    })

    if (!project) {
      throw new Error("Project not found")
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
                throw new Error(
                  `Edge already exits between source ${edge.source} and target ${edge.target}`
                )
              }
              return {
                where: { id: edge.id },
                create: {
                  id: edge.id,
                  source: edge.source,
                  target: edge.target,
                  type: TaskNodeType.TASK,
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
  } catch (error) {
    console.error(error)
    throw new Error((error as Error).message)
  }
}

export const deleteProject = async (id: string) => {
  return prisma.project.delete({
    where: { id },
  })
}

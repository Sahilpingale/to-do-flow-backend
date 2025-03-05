import { v4 as uuidv4 } from "uuid"
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"

// Load environment variables based on NODE_ENV
const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env.development"
dotenv.config({ path: envFile })

console.log("NODE_ENV", process.env.NODE_ENV)

console.log("DATABASE_URL", process.env.DATABASE_URL)

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
    },
  })

  const project = await prisma.project.create({
    data: {
      name: "Sample Project",
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  })

  console.log(`Created project with ID: ${project.id}`)

  // Step 2: Create task nodes
  const taskNodes = await prisma.taskNode.createMany({
    data: [
      {
        id: uuidv4(),
        title: "Task 1",
        description: "Description for Task 1",
        status: "TODO",
        positionX: 100,
        positionY: 200,
        type: "TASK",
        projectId: project.id,
      },
      {
        id: uuidv4(),
        title: "Task 2",
        description: "Description for Task 2",
        status: "IN_PROGRESS",
        positionX: 300,
        positionY: 400,
        type: "TASK",
        projectId: project.id,
      },
    ],
  })

  console.log(`Created ${taskNodes.count} task nodes.`)

  // Step 3: Fetch the created task nodes
  const nodes = await prisma.taskNode.findMany({
    where: { projectId: project.id },
    select: { id: true },
  })

  if (nodes.length >= 2) {
    // Step 4: Create task edges
    const edge = await prisma.taskEdge.create({
      data: {
        id: uuidv4(),
        source: nodes[0].id, // First task node ID
        target: nodes[1].id, // Second task node ID
        type: "TASK",
        animated: true,
        deletable: true,
        reconnectable: true,
        projectId: project.id,
      },
    })

    console.log(`Created edge with ID: ${edge.id}`)
  } else {
    console.warn("Not enough nodes to create an edge.")
  }

  console.log("Database populated successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

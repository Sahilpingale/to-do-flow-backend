import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Delete all edges
  const deleteAllEdges = await prisma.taskEdge.deleteMany()

  // Delete all nodes
  await prisma.taskNode.deleteMany()

  // Delete all projects
  await prisma.project.deleteMany()
}

console.log("Database deleted!")

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

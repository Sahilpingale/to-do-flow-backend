/*
  Warnings:

  - Changed the type of `type` on the `TaskEdge` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `TaskNode` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('TASK');

-- AlterTable
ALTER TABLE "TaskEdge" DROP COLUMN "type",
ADD COLUMN     "type" "NodeType" NOT NULL;

-- AlterTable
ALTER TABLE "TaskNode" DROP COLUMN "type",
ADD COLUMN     "type" "NodeType" NOT NULL;

-- DropEnum
DROP TYPE "TaskNodeType";

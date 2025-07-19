import { ITaskNode } from "../models/models"

export const generateTaskSuggestions = async (
  projectId: string,
  query: string,
  associatedNodes: ITaskNode[]
) => {
  console.log(projectId, query, associatedNodes)
  return { success: true }
}

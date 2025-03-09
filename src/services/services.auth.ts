import prisma from "../lib/prisma"
import { SignUpRequest } from "../controllers/controller.auth"

export const signUpNewUser = async ({
  email,
  displayName,
  photoURL,
  phoneNumber,
  uid,
}: SignUpRequest & { uid: string }) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })
  if (user) {
    throw new Error("User already exists")
  }
  const newUser = await prisma.user.create({
    data: {
      email,
      displayName,
      photoURL,
      phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: uid,
    },
  })
  return newUser
}

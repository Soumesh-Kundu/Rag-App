import { PrismaClient } from "@prisma/client"

// export const db=new PrismaClient()
function  prismaClientSingleton() {
  const prisma = new PrismaClient()
  return prisma
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
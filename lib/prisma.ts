import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export function getPrisma(): PrismaClient {
  if (global.prisma) return global.prisma;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
  }

  const prisma = new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
  }

  return prisma;
}

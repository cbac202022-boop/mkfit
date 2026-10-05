import { PrismaClient } from "@prisma/client";

// Réutilise le client entre les rechargements à chaud en développement.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

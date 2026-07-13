import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeads = async (where: Prisma.LeadWhereInput, limit: number, offset: number) => {
  return prisma.lead.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' }
  });
};

export const createLead = async (data: Prisma.LeadCreateInput) => {
  return prisma.lead.create({ data });
};

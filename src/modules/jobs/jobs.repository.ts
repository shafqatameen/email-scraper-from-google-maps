import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createJob = async (query: string) => {
  return prisma.job.create({
    data: { query, status: 'pending' }
  });
};

export const getJobById = async (id: string) => {
  return prisma.job.findUnique({
    where: { id },
    include: { leads: true }
  });
};

export const getAllJobs = async () => {
  return prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { leads: true } } }
  });
};

export const updateJobStatus = async (id: string, status: string) => {
  return prisma.job.update({
    where: { id },
    data: { status }
  });
};

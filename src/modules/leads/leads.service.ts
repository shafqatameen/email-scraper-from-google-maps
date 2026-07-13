import { getLeads, createLead } from './leads.repository';

export const fetchLeads = async (jobId?: string, limit: number = 50, page: number = 1) => {
  const where = jobId ? { jobId } : {};
  const offset = (page - 1) * limit;
  return getLeads(where, limit, offset);
};

export const saveLead = async (jobId: string, name: string, emails: string[], url?: string) => {
  return createLead({
    name,
    emails,
    url,
    job: { connect: { id: jobId } }
  });
};

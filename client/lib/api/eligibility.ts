import { apiClient } from './client';

export const eligibilityApi = {
  checkEligibility: async (schemeSlug: string, facts: Record<string, unknown>) => {
    const res = await apiClient.post(`/eligibility/check/${schemeSlug}`, facts);
    return res.data;
  },

  getHistory: async () => {
    const res = await apiClient.get('/eligibility/history');
    return res.data;
  },
};

import { apiClient } from './client';

export const schemesApi = {
  getSchemes: async (params?: Record<string, unknown>) => {
    const res = await apiClient.get('/schemes', { params });
    return res.data;
  },

  getSchemeBySlug: async (slug: string) => {
    const res = await apiClient.get(`/schemes/${slug}`);
    return res.data;
  },

  createScheme: async (data: Record<string, unknown>) => {
    const res = await apiClient.post('/schemes', data);
    return res.data;
  },

  addRuleSet: async (slug: string, data: Record<string, unknown>) => {
    const res = await apiClient.post(`/schemes/${slug}/rulesets`, data);
    return res.data;
  },
};

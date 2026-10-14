import { apiClient } from './client';

export const profileApi = {
  aiFill: async (text: string) => {
    const res = await apiClient.post('/profile/ai-fill', { text });
    return res.data;
  },

  updateProfile: async (data: Record<string, unknown>) => {
    const res = await apiClient.patch('/profile', data);
    return res.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await apiClient.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteAccount: async (email: string) => {
    const res = await apiClient.delete('/profile', { data: { email } });
    return res.data;
  },
};

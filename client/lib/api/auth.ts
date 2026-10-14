import { apiClient } from './client';

export const authApi = {
  sendOtp: async (email: string) => {
    const res = await apiClient.post('/auth/send-otp', { email });
    return res.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const res = await apiClient.post('/auth/verify-otp', { email, otp });
    return res.data;
  },

  googleLogin: async (credential: string) => {
    const res = await apiClient.post('/auth/google', { credential });
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
};

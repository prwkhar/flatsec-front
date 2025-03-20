// src/api/auth.ts
import axios from 'axios';

const API_BASE = 'http://10.53.0.58:3000/api';

export const loginOwner = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/owner/login`, { email, password });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.log(error.response);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const loginSecurity = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/security/login`, { email, password });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

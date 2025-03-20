import axios from 'axios';
const API_BASE = 'https://your-backend-url.com/api';

export const loginOwner = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE}/owner/login`, { email, password });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const loginSecurity = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE}/security/login`, { email, password });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

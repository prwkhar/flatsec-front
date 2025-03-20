import axios from 'axios';

const API_BASE = 'https://your-backend-url.com/api';

export const sendVisitorDetails = async (token: string, details: any) => {
  try {
    const response = await axios.post(`${API_BASE}/security/visitor`, details, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

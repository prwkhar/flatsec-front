import axios from 'axios';

const API_BASE = 'http://192.168.176.234:3000/api';

export const getsecuritytRequests = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE}/admin/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const sendsecurityDetails = async (
  token: string,
  details: { address: string; password: string;}
) => {
  try {
    const payload={
        email: details.address,
        password: details.password,
    }
    const response = await axios.post(`${API_BASE}/admin/addsecurity`, payload, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    console.log("sucess at api",response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const removeSecurityDetails = async (
  token: string, id : string
) => {
  try {
    const response = await axios.delete(`${API_BASE}/admin/removesecurity/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("sucess at api",response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.log(`error at remove security details`,error.response``);
    return { success: false, message: error.response?.data?.message || error.message };
  }
}
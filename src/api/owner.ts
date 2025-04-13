// src/api/owner.ts
import axios from 'axios';

const API_BASE = 'http://192.168.176.234:3000/api';

export const getVisitorRequests = async (token: string) => {
  try {
    const response = await axios.get(`${API_BASE}/owner/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const respondToRequest = async (token: string, requestId: string, accepted: boolean) => {
  try {
    const response = await axios.post(
      `${API_BASE}/owner/requests/${requestId}/respond`,
      { accepted },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const toggleCallPermission = async (token: string, permission: boolean) => {
  try {
    const res = await axios.patch(
      `${API_BASE}/owner/toggle-call-permission`,
      { permission },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return { success: true, permission: res.data.permission };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Error updating permission",
    };
  }
};

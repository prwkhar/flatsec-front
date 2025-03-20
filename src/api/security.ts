// src/api/security.ts
import axios from 'axios';

const API_BASE = 'http://10.53.0.58:3000/api';

export const sendVisitorDetails = async (
  token: string,
  details: { name: string; address: string; time: string; purpose: string },
  imageUri?: string
) => {
  try {
    const formData = new FormData();
    formData.append('name', details.name);
    formData.append('address', details.address);
    formData.append('time', details.time);
    formData.append('purpose', details.purpose);

    if (imageUri) {
      // For Expo ImagePicker, you get a URI; include file info
      formData.append('image', {
        uri: imageUri,
        name: 'visitor.jpg',
        type: 'image/jpeg',
      } as any);
    }

    const response = await axios.post(`${API_BASE}/security/visitor`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

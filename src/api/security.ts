import axios from 'axios';

const API_BASE = `http://192.168.176.234:3000/api`;

export const sendVisitorDetails = async (
  token: string,
  details: { name: string; address: string; phoneno: string; purpose: string; roomno: number },
  imageUri?: string
) => {
  try {
    const formData = new FormData();
    formData.append('name', details.name);
    formData.append('address', details.address);
    formData.append('phoneno', details.phoneno);
    formData.append('purpose', details.purpose);
    formData.append('roomno', details.roomno.toString());
    if (imageUri) {
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

export const findownerroomno = async (token: string, roomno: string) => {
  try{
    console.log(roomno);
    const response = await axios.get(`${API_BASE}/security/owner/${roomno}`, 
    {
      headers: { Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json'
      },
    });
    console.log("response at find owner room no",response.data);
    return { success: true, body: response.data};
  }
  catch (error: any) {
    console.log("error at find owner room no",error.response);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

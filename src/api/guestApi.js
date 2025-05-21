import axios from "axios";

const BASE_URL = "http://localhost:5000/api/wedding/v1"; // sesuaikan dengan backendmu

export const getGuests = () => axios.get(`${BASE_URL}/guests`);
export const createGuest = (data) => axios.post(`${BASE_URL}/guests`, data);
export const updateGuest = (id, data) =>
  axios.put(`${BASE_URL}/guests/${id}`, data);
export const deleteGuest = (id) => axios.delete(`${BASE_URL}/guests/${id}`);
export const uploadGuestExcel = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(`${BASE_URL}/guests/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

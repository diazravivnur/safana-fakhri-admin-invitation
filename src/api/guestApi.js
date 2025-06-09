import axios from "axios";

// const BASE_URL = "http://localhost:5000/api/wedding/v1"; // sesuaikan dengan backendmu
const BASE_URL = "https://doa-backend.my.id/invitation/api/wedding/v1"; // sesuaikan dengan backendmu

export const getGuests = () => axios.get(`${BASE_URL}/guests`);
export const createGuest = (data) => axios.post(`${BASE_URL}/guests`, data);
export const updateGuest = (id, data) =>
  axios.put(`${BASE_URL}/guests/${id}`, data);
export const deleteGuest = (id) => axios.delete(`${BASE_URL}/guests/${id}`);
export const shareInvitation = (id) =>
  axios.post(`${BASE_URL}/guests/shared/${id}`);
export const uploadGuestExcel = (file, origin) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("origin", origin); // ✅ kirim origin dari parameter
  return axios.post(`${BASE_URL}/guests/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const uploadGroupImage = (file, groupName) => {
  const formData = new FormData();
  formData.append("imageFile", file);
  formData.append("groupName", groupName);

  return axios.post(`${BASE_URL}/guests/group-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const shareGroupLink = (id) =>
  axios.patch(`${BASE_URL}/groups/${id}/share`);

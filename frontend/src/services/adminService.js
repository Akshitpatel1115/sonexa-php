import adminApi from "../api/adminAxios";

export const adminLogin = async (credentials) => {
  const response = await adminApi.post("/admin/auth/login", credentials);
  return response.data;
};

export const adminLogout = async () => {
  const response = await adminApi.post("/admin/auth/logout");
  return response.data;
};

export const getAdminMe = async () => {
  const response = await adminApi.get("/admin/auth/me");
  return response.data.admin;
};

export const getDashboardStats = async () => {
  const response = await adminApi.get("/admin/dashboard");
  return response.data.stats;
};

export const getAdminUsers = async (search = "") => {
  const response = await adminApi.get(`/admin/users?search=${search}`);
  return response.data.users;
};

export const blockUser = async (id) => {
  const response = await adminApi.put(`/admin/users/${id}/block`);
  return response.data;
};

export const unblockUser = async (id) => {
  const response = await adminApi.put(`/admin/users/${id}/unblock`);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await adminApi.delete(`/admin/users/${id}`);
  return response.data;
};

export const getAdminArtists = async (search = "") => {
  const response = await adminApi.get(`/admin/artists?search=${search}`);
  return response.data.artists;
};

export const approveArtist = async (id) => {
  const response = await adminApi.put(`/admin/artists/${id}/approve`);
  return response.data;
};

export const suspendArtist = async (id) => {
  const response = await adminApi.put(`/admin/artists/${id}/suspend`);
  return response.data;
};

export const rejectArtist = async (id) => {
  const response = await adminApi.delete(`/admin/artists/${id}/reject`);
  return response.data;
};

export const getAdminMusic = async (search = "") => {
  const response = await adminApi.get(`/admin/music?search=${search}`);
  return response.data.musics;
};

export const deleteAdminMusic = async (id) => {
  const response = await adminApi.delete(`/admin/music/${id}`);
  return response.data;
};

export const getAdminAlbums = async (search = "") => {
  const response = await adminApi.get(`/admin/albums?search=${search}`);
  return response.data.albums;
};

export const deleteAdminAlbum = async (id) => {
  const response = await adminApi.delete(`/admin/albums/${id}`);
  return response.data;
};

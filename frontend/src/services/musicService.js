import api from "../api/axios";

export const getAllMusic = async (page = 1, limit = 10) => {
  const response = await api.get(`/music?page=${page}&limit=${limit}`);
  if (Array.isArray(response.data.musics)) {
    return { data: response.data.musics, current_page: 1, last_page: 1 };
  }
  return response.data.musics;
};

export const createMusic = async (formData) => {
  const response = await api.post("/music/createMusic", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const createAlbum = async (payload) => {
  const response = await api.post("/album/createAlbum", payload);
  return response.data;
};

export const deleteMusic = async (id) => {
  const response = await api.delete(`/music/deleteMusic/${id}`);
  return response.data;
};

export const getAllAlbums = async (page = 1, limit = 10) => {
  const response = await api.get(`/album?page=${page}&limit=${limit}`);
  if (Array.isArray(response.data.albums)) {
    return { data: response.data.albums, current_page: 1, last_page: 1 };
  }
  return response.data.albums;
};

export const getAlbumById = async (albumId) => {
  const response = await api.get(`/album/${albumId}`);
  return response.data.albums;
};

export const updateAlbum = async (albumId, payload) => {
  const response = await api.put(`/album/${albumId}`, payload);
  return response.data;
};

export const deleteAlbum = async (albumId) => {
  const response = await api.delete(`/album/${albumId}`);
  return response.data;
};
export const globalSearch = async (query, signal) => {
  const response = await api.get(`/search?q=${query}`, { signal });
  return response.data;
};

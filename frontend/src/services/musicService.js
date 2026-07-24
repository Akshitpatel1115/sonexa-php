import api from "../api/axios";

export const getAllMusic = async () => {
  const response = await api.get("/music");
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

export const getAllAlbums = async () => {
  const response = await api.get("/album");
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
export const globalSearch = async (query) => {
  const response = await api.get(`/search?q=${query}`);
  return response.data;
};

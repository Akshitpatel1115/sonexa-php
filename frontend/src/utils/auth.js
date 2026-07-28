export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

export const isLoggedIn = () => {
  return !!getToken();
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("admin_token");
  localStorage.removeItem("sonexa_recent_tracks");
  localStorage.removeItem("sonexa_playback_history");
  localStorage.removeItem("sonexa_recent_searches");
};
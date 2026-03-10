import api from "./api";

export const getApplications = async () => {
  const response = await api.get("/applications/");
  return response.data;
};

export const deleteApplication = (id) => {
  return api.delete(`/applications/${id}`);
};

export const getApplicationStats = async () => {
  const response = await api.get("/applications/stats");
  return response.data;
};

export const updateApplication = async (id, data) => {
  const response = await api.put(`/applications/${id}`, data);
  return response.data;
};
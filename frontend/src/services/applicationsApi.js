import api from "./api";

export const getApplications = () => {
  return api.get("/applications/");
};

export const deleteApplication = (id) => {
  return api.delete(`/applications/${id}`);
};
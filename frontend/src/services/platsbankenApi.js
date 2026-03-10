import api from "./api";

export const searchJobs = (query, offset = 0, limit = 10) =>
  api.get(`/platsbanken/search?q=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}`);

export const getAd = (adId) =>
  api.get(`/platsbanken/ad/${adId}`);

export const autocomplete = (query) =>
  api.get(`/platsbanken/complete?q=${encodeURIComponent(query)}`);

export const saveApplication = (data) =>
  api.post("/platsbanken/save-application", data);

export const saveReminder = (data) =>
  api.post("/platsbanken/save-reminder", data);

export const matchCV = (adId) =>
  api.get(`/platsbanken/match-cv?ad_id=${adId}`);

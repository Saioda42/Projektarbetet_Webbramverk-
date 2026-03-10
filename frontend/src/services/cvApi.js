// frontend/src/services/cvApi.js

import api from './api';

// Hämta mitt CV
export const getMyCV = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/cv/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Skapa/uppdatera CV
export const createOrUpdateCV = async (cvData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/cv/', cvData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Lägg till experience
export const addExperience = async (expData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/cv/experience', expData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Ta bort experience
export const deleteExperience = async (expId) => {
  const token = localStorage.getItem('token');
  await api.delete(`/cv/experience/${expId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Lägg till education
export const addEducation = async (eduData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/cv/education', eduData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Ta bort education
export const deleteEducation = async (eduId) => {
  const token = localStorage.getItem('token');
  await api.delete(`/cv/education/${eduId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Lägg till skill
export const addSkill = async (skillData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/cv/skill', skillData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Ta bort skill
export const deleteSkill = async (skillId) => {
  const token = localStorage.getItem('token');
  await api.delete(`/cv/skill/${skillId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
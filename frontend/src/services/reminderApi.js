// frontend/src/services/reminderApi.js

import api from './api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Hämta alla påminnelser
export const getAllReminders = async () => {
  const response = await api.get('/reminders/', getAuthHeaders());
  return response.data;
};

// Hämta kommande påminnelser
export const getUpcomingReminders = async () => {
  const response = await api.get('/reminders/upcoming', getAuthHeaders());
  return response.data;
};

// Skapa påminnelse
export const createReminder = async (reminderData) => {
  const response = await api.post('/reminders/', reminderData, getAuthHeaders());
  return response.data;
};

// Ta bort påminnelse
export const deleteReminder = async (reminderId) => {
  await api.delete(`/reminders/${reminderId}`, getAuthHeaders());
};

// Markera som skickad
export const markReminderAsSent = async (reminderId) => {
  const response = await api.put(`/reminders/${reminderId}/mark-sent`, {}, getAuthHeaders());
  return response.data;
};
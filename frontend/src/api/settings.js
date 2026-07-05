import { apiRequest } from "./client";

// Hotel profile
export const getHotelProfile = () => apiRequest("/settings/hotel");
export const updateHotelProfile = (data) =>
  apiRequest("/settings/hotel", { method: "PUT", body: data });

// Rooms
export const getRooms = () => apiRequest("/settings/rooms");
export const addRoom = (data) =>
  apiRequest("/settings/rooms", { method: "POST", body: data });
export const deleteRoom = (id) =>
  apiRequest(`/settings/rooms/${id}`, { method: "DELETE" });

// Users
export const getUsers = () => apiRequest("/settings/users");
export const addUser = (data) =>
  apiRequest("/settings/users", { method: "POST", body: data });
export const updateUserRole = (id, role) =>
  apiRequest(`/settings/users/${id}/role`, { method: "PATCH", body: { role } });
export const deleteUser = (id) =>
  apiRequest(`/settings/users/${id}`, { method: "DELETE" });

// Change password
export const changePassword = (data) =>
  apiRequest("/settings/password", { method: "PUT", body: data });

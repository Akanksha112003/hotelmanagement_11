import { apiRequest } from "./client";

export const listRooms = () => apiRequest("/rooms");

export const getRoom = (id) => apiRequest(`/rooms/${id}`);

export const addNewRoom = (data) =>
  apiRequest("/rooms", { method: "POST", body: data });

export const editRoom = (id, data) =>
  apiRequest(`/rooms/${id}`, { method: "PUT", body: data });

export const setRoomStatus = (id, status) =>
  apiRequest(`/rooms/${id}/status`, { method: "PATCH", body: { status } });

export const removeRoom = (id) =>
  apiRequest(`/rooms/${id}`, { method: "DELETE" });

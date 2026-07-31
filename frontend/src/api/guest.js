import { apiRequest } from "./client";

export const listGuests = () => apiRequest("/guests");

export const getGuest = (id) => apiRequest(`/guests/${id}`);

export const addNewGuest = (data) =>
  apiRequest("/guests", { method: "POST", body: data });

export const editGuest = (id, data) =>
  apiRequest(`/guests/${id}`, { method: "PUT", body: data });

export const removeGuest = (id) =>
  apiRequest(`/guests/${id}`, { method: "DELETE" });

import { apiRequest } from "./client";

export const listBookings = () => apiRequest("/bookings");

export const getBooking = (id) => apiRequest(`/bookings/${id}`);

export const addNewBooking = (data) =>
  apiRequest("/bookings", { method: "POST", body: data });

export const editBooking = (id, data) =>
  apiRequest(`/bookings/${id}`, { method: "PUT", body: data });

export const setBookingStatus = (id, statusData) =>
  apiRequest(`/bookings/${id}/status`, { method: "PATCH", body: statusData });

export const convertBookingToCheckInApi = (id) =>
  apiRequest(`/bookings/${id}/check-in`, { method: "POST" });

export const removeBooking = (id) =>
  apiRequest(`/bookings/${id}`, { method: "DELETE" });

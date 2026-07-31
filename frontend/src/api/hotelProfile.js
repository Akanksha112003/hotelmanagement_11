import { apiRequest } from "./client";

export const getHotelProfileDoc = () => apiRequest("/hotel-profile");

export const saveHotelProfile = (data) =>
  apiRequest("/hotel-profile", { method: "POST", body: data });

export const updateHotelProfileDoc = (data) =>
  apiRequest("/hotel-profile", { method: "PUT", body: data });

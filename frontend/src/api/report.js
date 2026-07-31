import { apiRequest } from "./client";

// All report endpoints are read-only GET requests.

export const getReportDashboard = () => apiRequest("/reports/dashboard");

export const getReportRevenue = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/reports/revenue${qs ? `?${qs}` : ""}`);
};

export const getReportOccupancy = () => apiRequest("/reports/occupancy");

export const getReportBookings = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/reports/bookings${qs ? `?${qs}` : ""}`);
};

export const getReportGuests = () => apiRequest("/reports/guests");

export const getReportFood = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/reports/food${qs ? `?${qs}` : ""}`);
};

export const getReportPayments = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiRequest(`/reports/payments${qs ? `?${qs}` : ""}`);
};

export const getReportHousekeeping = () => apiRequest("/reports/housekeeping");

import { apiRequest } from "./client";

export const getDashboardStats = () => apiRequest("/dashboard/stats");

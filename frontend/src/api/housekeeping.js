import { apiRequest } from "./client";

export const getTasks = () => apiRequest("/housekeeping");

export const createTask = (data) =>
  apiRequest("/housekeeping", { method: "POST", body: data });

export const updateTaskStatus = (id, status) =>
  apiRequest(`/housekeeping/${id}/status`, {
    method: "PATCH",
    body: { status },
  });

export const deleteTask = (id) =>
  apiRequest(`/housekeeping/${id}`, { method: "DELETE" });

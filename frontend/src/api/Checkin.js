import { apiRequest } from "./client";

export function getCheckins() {
  return apiRequest("/checkins");
}

export function createCheckin(data) {
  return apiRequest("/checkins", {
    method: "POST",
    body: data,
  });
}
export function deleteCheckin(id) {
  return apiRequest(`/checkins/${id}`, {
    method: "DELETE",
  });
}

export function checkoutGuest(id) {
  return apiRequest(`/checkins/${id}/checkout`, {
    method: "PATCH",
  });
}

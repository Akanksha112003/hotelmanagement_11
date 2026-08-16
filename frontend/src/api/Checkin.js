import { apiRequest } from "./client";

export function getCheckins() {
  return apiRequest("/checkin");
}

export function createCheckin(data) {
  return apiRequest("/checkin", {
    method: "POST",
    body: data,
  });
}

export function deleteCheckin(id) {
  return apiRequest(`/checkin/${id}`, {
    method: "DELETE",
  });
}

// Updates the check-in record status to checked-out
export function checkoutGuest(id) {
  return apiRequest(`/checkin/${id}`, {
    method: "PUT",
    body: { status: "checked-out" },
  });
}


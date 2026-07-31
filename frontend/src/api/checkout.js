import { apiRequest } from "./client";

export const getCheckouts = () => apiRequest("/checkout");
export const listCheckouts = getCheckouts;

export const createCheckout = (data) =>
  apiRequest("/checkout", { method: "POST", body: data });

export const getCheckout = (id) => apiRequest(`/checkout/${id}`);

export const updateCheckoutPayment = (id, paymentStatus) =>
  apiRequest(`/checkout/${id}/payment`, {
    method: "PATCH",
    body: { paymentStatus },
  });

export const deleteCheckout = (id) =>
  apiRequest(`/checkout/${id}`, { method: "DELETE" });

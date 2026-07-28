import { apiRequest } from "./client";

export const getFoodOrders = () => apiRequest("/foodorders");

export const createFoodOrder = (data) =>
  apiRequest("/foodorders", { method: "POST", body: data });

export const getFoodOrder = (id) => apiRequest(`/foodorders/${id}`);

export const updateOrderStatus = (id, orderStatus) =>
  apiRequest(`/foodorders/${id}/status`, {
    method: "PATCH",
    body: { orderStatus },
  });

export const updatePaymentStatus = (id, paymentStatus) =>
  apiRequest(`/foodorders/${id}/payment`, {
    method: "PATCH",
    body: { paymentStatus },
  });

export const deleteFoodOrder = (id) =>
  apiRequest(`/foodorders/${id}`, { method: "DELETE" });

import { apiRequest } from "./client";

export const listInvoices = () => apiRequest("/invoices");

export const getInvoice = (id) => apiRequest(`/invoices/${id}`);

export const addNewInvoice = (data) =>
  apiRequest("/invoices", { method: "POST", body: data });

export const editInvoice = (id, data) =>
  apiRequest(`/invoices/${id}`, { method: "PUT", body: data });

export const recordInvoicePayment = (id, paymentData) =>
  apiRequest(`/invoices/${id}/payment`, { method: "PATCH", body: paymentData });

export const removeInvoice = (id) =>
  apiRequest(`/invoices/${id}`, { method: "DELETE" });

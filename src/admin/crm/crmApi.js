import { api } from "../../lib/api";

export function toQuery(params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "" && value !== false) search.set(key, value);
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export const getDashboard = (signal) => api("/admin/dashboard", { signal });

export const listEnquiries = (params, signal) => api(`/admin/enquiries${toQuery(params)}`, { signal });
export const exportEnquiries = (params) => api(`/admin/enquiries/export${toQuery(params)}`);
export const getEnquiry = (id, signal) => api(`/admin/enquiries/${id}`, { signal });
export const createEnquiry = (body) => api("/admin/enquiries", { method: "POST", body });
export const updateEnquiry = (id, body) => api(`/admin/enquiries/${id}`, { method: "PUT", body });
export const patchEnquiry = (id, body) => api(`/admin/enquiries/${id}`, { method: "PATCH", body });
export const deleteEnquiry = (id) => api(`/admin/enquiries/${id}`, { method: "DELETE" });
export const addNote = (id, text) => api(`/admin/enquiries/${id}/notes`, { method: "POST", body: { text } });
export const deleteNote = (id, noteId) => api(`/admin/enquiries/${id}/notes/${noteId}`, { method: "DELETE" });

export const listCustomers = (params, signal) => api(`/admin/customers${toQuery(params)}`, { signal });
export const exportCustomers = (params) => api(`/admin/customers/export${toQuery(params)}`);
export const getCustomer = (id, signal) => api(`/admin/customers/${id}`, { signal });
export const createCustomer = (body) => api("/admin/customers", { method: "POST", body });
export const updateCustomer = (id, body) => api(`/admin/customers/${id}`, { method: "PUT", body });
export const deleteCustomer = (id) => api(`/admin/customers/${id}`, { method: "DELETE" });

export const listVendors = (params, signal) => api(`/admin/vendors${toQuery(params)}`, { signal });
export const exportVendors = (params) => api(`/admin/vendors/export${toQuery(params)}`);
export const getVendor = (id, signal) => api(`/admin/vendors/${id}`, { signal });
export const createVendor = (body) => api("/admin/vendors", { method: "POST", body });
export const updateVendor = (id, body) => api(`/admin/vendors/${id}`, { method: "PUT", body });
export const deleteVendor = (id) => api(`/admin/vendors/${id}`, { method: "DELETE" });

export const createQuote = (enquiryId) => api("/admin/quotes", { method: "POST", body: { enquiryId } });
export const getQuote = (id, signal) => api(`/admin/quotes/${id}`, { signal });
export const updateQuote = (id, body) => api(`/admin/quotes/${id}`, { method: "PUT", body });
export const duplicateQuote = (id) => api(`/admin/quotes/${id}/duplicate`, { method: "POST" });
export const markQuoteSent = (id, channel) => api(`/admin/quotes/${id}/sent`, { method: "POST", body: { channel } });
export const deleteQuote = (id) => api(`/admin/quotes/${id}`, { method: "DELETE" });

export const getSettings = (signal) => api("/admin/settings", { signal });
export const updateSettings = (body) => api("/admin/settings", { method: "PUT", body });

export const importRows = (kind, rows, dryRun) => api(`/admin/${kind}/import`, { method: "POST", body: { rows, dryRun } });

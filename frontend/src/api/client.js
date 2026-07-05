// Central HTTP client. Every API module builds on this — pages never call fetch directly.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/**
 * Make a JSON request to the backend.
 * @param {string} path        e.g. "/auth/login"
 * @param {object} options
 * @param {string} [options.method="GET"]
 * @param {object} [options.body]   plain object, serialized to JSON
 * @param {string} [options.token]  Bearer token; falls back to stored token
 * @returns {Promise<any>} parsed JSON response
 * @throws  {Error} with the server message on a non-2xx / unsuccessful response
 */
export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  const authToken = token ?? localStorage.getItem("token");
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response (e.g. empty body)
  }

  // Backend uses both `success` and the legacy `sucess` spelling.
  const ok = res.ok && data?.success !== false && data?.sucess !== false;
  if (!ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

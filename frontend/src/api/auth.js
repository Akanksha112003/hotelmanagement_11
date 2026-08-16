// Auth API. Import these functions in pages instead of writing fetch logic.
import { apiRequest } from "./client";

/**
 * Log a user in.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 */
export function login({ email, password }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<{ token: string, user: object }>}
 */
export function register({ name, email, password }) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}

/**
 * Reset password for a registered user (no token required).
 * @param {{ email: string, newPassword: string }} payload
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export function forgotPassword({ email, newPassword }) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: { email, newPassword },
  });
}

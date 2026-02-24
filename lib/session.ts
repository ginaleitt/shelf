/**
 * Client-side session utilities.
 * Stores and retrieves the admin session token from localStorage.
 */

const TOKEN_KEY = "shelf_admin_token";

/** Saves the session token to localStorage */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Retrieves the session token from localStorage, or null if not present */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Removes the session token from localStorage */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Returns Authorization header object for use in fetch calls */
export function authHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

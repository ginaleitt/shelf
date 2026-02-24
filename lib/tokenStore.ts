/**
 * Shared in-memory token store.
 * Lives in lib/ so it's a single module instance shared across all API routes.
 */

const validTokens = new Set<string>();

export function addToken(token: string): void {
  validTokens.add(token);
}

export function removeToken(token: string): void {
  validTokens.delete(token);
}

export function isValidToken(token: string | null | undefined): boolean {
  if (!token) return false;
  return validTokens.has(token);
}

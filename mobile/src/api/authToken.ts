/**
 * The bearer token for the signed-in user. AuthContext owns the session and
 * publishes it here so the API modules stay free of React plumbing.
 */
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

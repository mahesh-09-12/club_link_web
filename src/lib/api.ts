export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("clublink_auth_token");
}

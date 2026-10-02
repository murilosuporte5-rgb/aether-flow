export type AuthHashTokens = { accessToken: string; refreshToken: string };

export function readAuthHashTokens(hash: string): AuthHashTokens | null {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const accessToken = params.get("access_token")?.trim() || "";
  const refreshToken = params.get("refresh_token")?.trim() || "";
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

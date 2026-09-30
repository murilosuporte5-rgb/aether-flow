/** Use the deployment's configured public domain, never forwarded client headers. */
export function isRequestOriginAllowed(
  origin: string | null,
  requestUrl: string,
  publicDomain?: string,
): boolean {
  if (!origin) return true; // Auth and tenant authorization remain mandatory.
  try {
    const expected = publicDomain
      ? new URL(`https://${publicDomain}`).origin
      : new URL(requestUrl).origin;
    const supplied = new URL(origin);
    return supplied.origin === origin && origin === expected;
  } catch {
    return false;
  }
}

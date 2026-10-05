type Entry = { at: number };

const globalKey = "__aetherWhatsappAttemptWindow";
const windows: Map<string, Entry> =
  (globalThis as typeof globalThis & { [globalKey]?: Map<string, Entry> })[globalKey] ||
  new Map<string, Entry>();
(
  globalThis as typeof globalThis & { [globalKey]?: Map<string, Entry> }
)[globalKey] = windows;

/** Protects the expensive Evolution create/connect calls from repeated clicks. */
export function consumeWhatsAppAttempt(key: string, cooldownMs = 15_000) {
  const now = Date.now();
  const previous = windows.get(key);
  if (previous && now - previous.at < cooldownMs) {
    return { allowed: false, retryAfter: Math.ceil((cooldownMs - (now - previous.at)) / 1000) };
  }
  windows.set(key, { at: now });
  if (windows.size > 2000) {
    for (const [entryKey, entry] of windows) if (now - entry.at > cooldownMs * 2) windows.delete(entryKey);
  }
  return { allowed: true, retryAfter: 0 };
}

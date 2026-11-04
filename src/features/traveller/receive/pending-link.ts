// The place link that opened the app, handed from `src/app/+native-intent.tsx` to the receive
// screen and read once (security review of spec 019): never a stale URL read again on a
// later visit, never the wrong one when two links come in a row.

let pending: string | null = null;

export function keepPendingLink(url: string): void {
  pending = url;
}

/** The link waiting to be read, then forgotten. */
export function takePendingLink(): string | null {
  const url = pending;
  pending = null;
  return url;
}

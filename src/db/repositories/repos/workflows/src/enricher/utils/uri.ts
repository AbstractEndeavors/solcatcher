
// ───────────────── Offchain JSON fetcher ─────────────────
export async function fetchOffchainJson(uri: string): Promise<any | null> {
  if (!uri || uri.trim() === '') return null;

  // Handle IPFS
  let fetchUrl = uri;
  if (uri.startsWith('ipfs://')) {
    fetchUrl = `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(fetchUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('json')) return null;

    return await res.json();
  } catch {
    return null;
  }
}

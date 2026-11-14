// Limite simples por endereço, em memória, para os formulários públicos não virarem porta de spam.
const hits = new Map<string, number[]>();
const MAX_TRACKED = 10_000;

export function allowRequest(key: string, max: number, windowMs: number, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((time) => time > now - windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  if (hits.size >= MAX_TRACKED && !hits.has(key)) hits.clear();
  hits.set(key, recent);
  return true;
}

export function resetRateLimit() {
  hits.clear();
}

/** Só http(s): qualquer outro protocolo (javascript:, data: ...) é descartado antes de virar link. */
export function safeHttpUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
}

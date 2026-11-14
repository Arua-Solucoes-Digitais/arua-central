// Endereços internos escritos à mão (<a href="/...">) precisam do caminho base do site:
// "/" no site real e "/arua-central/" na demonstração do GitHub Pages.
// Links do roteador (<Link to>) já recebem o caminho base sozinhos.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function withBase(href: string) {
  return href.startsWith("/") && !href.startsWith("//") ? `${BASE}${href}` : href;
}

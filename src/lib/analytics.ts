// Medição de visitas e cliques que respeita a privacidade (LGPD):
// sem cookies, sem IP, sem identificador de pessoa. Só página, rótulo do clique e tipo de aparelho.
import { recordEvent } from "./api";

function device(): "mobile" | "desktop" {
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

export function track(event_type: "pageview" | "click", label?: string) {
  if (typeof window === "undefined") return;
  if (navigator.doNotTrack === "1") return;
  if (window.location.pathname.startsWith("/admin")) return;
  void recordEvent({
    data: {
      event_type,
      path: window.location.pathname.slice(0, 200),
      label: label?.slice(0, 100) ?? null,
      device: device(),
    },
  }).catch(() => undefined);
}

// Qualquer elemento com data-track="rótulo" conta um clique.
export function installClickTracking() {
  const handler = (e: MouseEvent) => {
    const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
    if (el?.dataset["track"]) track("click", el.dataset["track"]);
  };
  document.addEventListener("click", handler);
  return () => document.removeEventListener("click", handler);
}

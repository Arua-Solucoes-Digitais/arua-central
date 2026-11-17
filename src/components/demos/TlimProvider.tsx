// Tlim © Aruá Soluções Digitais · desenvolvido por CjotaDEV7.
// Entrega o estado da demonstração ao cardápio online e à área do gestor (mesma sessão da página).
import { useMemo, useReducer, type ReactNode } from "react";
import type { ClientDemo } from "@/content/demos/types";
import { initialState, TlimContext, tlimReducer } from "./tlim-store";

export function TlimProvider({ demo, children }: { demo: ClientDemo; children: ReactNode }) {
  const [state, dispatch] = useReducer(tlimReducer, demo, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <TlimContext.Provider value={value}>{children}</TlimContext.Provider>;
}

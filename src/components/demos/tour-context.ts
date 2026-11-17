// Estado da visita guiada. Só em memória (sem localStorage): recarregar a página
// mostra a orientação de novo, e nada do visitante é guardado.
import { createContext, useContext } from "react";

export type TourState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const TourContext = createContext<TourState | null>(null);

export function useTour(): TourState {
  const value = useContext(TourContext);
  if (!value) throw new Error("useTour precisa estar dentro de <TourProvider>.");
  return value;
}

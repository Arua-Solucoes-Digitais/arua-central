// true only in the static demo build (npm run build:demo, published on GitHub Pages).
export const IS_STATIC_DEMO = import.meta.env.VITE_ARUA_STATIC_DEMO === "1";

export const DEMO_NOTICE =
  "Versão de demonstração: os dados são de exemplo, nada é salvo e a área restrita está desativada.";

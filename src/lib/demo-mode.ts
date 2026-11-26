// true only in the static demo build (npm run build:demo, published on GitHub Pages).
export const IS_STATIC_DEMO = import.meta.env.VITE_ARUA_STATIC_DEMO === "1";

export const DEMO_NOTICE =
  "Versão de demonstração: os dados são de exemplo, nada é salvo e a área restrita está desativada.";

export const DEMO_NOTICE_SHORT = "Demonstração: dados de exemplo, nada é salvo.";

// Site do domínio (npm run build:site): também é estático, mas é a vitrine comercial.
// Sem aviso de demonstração, sem área restrita, e o contato vai direto para o WhatsApp.
export const IS_PUBLIC_SITE = import.meta.env.VITE_ARUA_PUBLIC_SITE === "1";

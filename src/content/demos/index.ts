// Tlim © Aruá Soluções Digitais · desenvolvido por CjotaDEV7.
// Registro da demonstração do Tlim: ordem das áreas do gestor, textos e formatação.
import { tlim } from "./tlim";
import type {
  ActivityStatus,
  Certainty,
  Channel,
  ClientDemo,
  DataNature,
  DemoArea,
  OrderMode,
  OrderStatus,
  Payment,
} from "./types";

export type { ClientDemo, DemoArea } from "./types";

export const demos: Record<string, ClientDemo> = {
  [tlim.slug]: tlim,
};

export function getDemo(slug: string): ClientDemo | undefined {
  return Object.hasOwn(demos, slug) ? demos[slug] : undefined;
}

/** Ordem das áreas do gestor (e da visita guiada). */
export const demoAreas: { id: DemoArea; label: string; short: string }[] = [
  { id: "visao-geral", label: "Visão geral", short: "Visão geral" },
  { id: "pedidos", label: "Pedidos", short: "Pedidos" },
  { id: "cardapio", label: "Cardápio", short: "Cardápio" },
  { id: "crm", label: "Clientes (CRM)", short: "CRM" },
  { id: "whatsapp", label: "WhatsApp", short: "WhatsApp" },
  { id: "instagram", label: "Instagram", short: "Instagram" },
  { id: "pesquisas", label: "Pesquisas", short: "Pesquisas" },
  { id: "aprovacoes", label: "Aprovações", short: "Aprovações" },
  { id: "ponto-de-partida", label: "Ponto de partida", short: "Diagnóstico" },
];

export function areaIndex(area: DemoArea) {
  return demoAreas.findIndex((a) => a.id === area);
}

export function isDemoArea(value: string): value is DemoArea {
  return demoAreas.some((a) => a.id === value);
}

/** Assinatura que aparece em todas as telas da demonstração. */
export const signature = {
  product: "Tlim",
  owner: "Aruá Soluções Digitais",
  developer: "CjotaDEV7",
  line: "Tlim © 2026 Aruá Soluções Digitais · desenvolvido por CjotaDEV7",
};

export const demoCopy = {
  product: "Tlim",
  productTagline: "Central de pedidos, cardápio online e gestão de clientes",
  indexTitle: "Demonstrações",
  indexIntro:
    "Experimente as soluções da Aruá como um cliente e como um gestor. Nada do que você fizer é salvo ou enviado.",
  start: "Entrar na área do gestor",
  storeCta: "Fazer um pedido como cliente",
  entryNotice:
    "Demonstração: restaurante fictício, com cardápio, clientes e pedidos de exemplo. Nada do que você fizer aqui é salvo ou enviado.",
  panelNotice: "Área do gestor · demonstração · nada é salvo",
  watermark: "Modo demonstração · Tlim por Aruá",
  backToArua: "Voltar à Aruá",
  guide: {
    title: "Orientação",
    represents: "O que esta área faz",
    problem: "Qual problema resolve",
    howAruaUses: "Como a Aruá implanta",
    whatIsReal: "O que é real aqui",
    previous: "Anterior",
    next: "Próxima área",
    finish: "Concluir visita",
    close: "Encerrar orientação",
    reopen: "Mostrar orientação",
    progress: (step: number, total: number) => `Etapa ${step} de ${total}`,
    finished:
      "Visita concluída. Continue usando as áreas, ou faça um pedido no cardápio e veja chegar em Pedidos.",
  },
  backToOverview: "Voltar à visão geral",
  exit: "Voltar à Aruá",
  areasNav: "Áreas do gestor",
};

export const natureLabels: Record<DataNature, { label: string; explain: string }> = {
  real: { label: "Real", explain: "Observado em uma fonte, na data indicada." },
  estimativa: { label: "Estimativa", explain: "Calculado por um método declarado." },
  simulacao: { label: "Simulação", explain: "Usado apenas para demonstrar a interface." },
};

export const certaintyLabels: Record<Certainty, string> = {
  verificado: "Verificado",
  hipotese: "Hipótese",
  pendente: "Pendente de confirmação",
};

export const activityStatusLabels: Record<ActivityStatus, string> = {
  planejado: "Planejado",
  andamento: "Em andamento",
  aguardando: "Aguardando aprovação",
  aprovado: "Aprovado",
  concluido: "Concluído",
  ajustes: "Necessita de ajustes",
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  novo: "Novos",
  preparo: "Em preparo",
  saiu: "Prontos / a caminho",
  concluido: "Concluídos",
};

export const orderModeLabels: Record<OrderMode, string> = {
  entrega: "Entrega",
  retirada: "Retirada",
};

export const paymentLabels: Record<Payment, string> = {
  pix: "Pix",
  cartao: "Cartão na entrega",
  dinheiro: "Dinheiro",
};

export const channelLabels: Record<Channel, string> = {
  cardapio: "Cardápio online",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
};

export const CONCEPT_LABEL = "Exemplo conceitual — não publicado";

export function formatNumber(value: number, decimals = 0) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** 2200 → "R$ 22,00" (valores de exemplo do restaurante fictício). */
export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function minutesAgoLabel(minutes: number) {
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const h = Math.floor(minutes / 60);
  return `há ${h} h`;
}

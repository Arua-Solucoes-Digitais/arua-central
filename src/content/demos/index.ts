// Registro das demonstrações guiadas. Para incluir outro cliente: crie o arquivo de dados
// (mesmo contrato de ./types), adicione-o em `demos` e um tema em src/styles.css.
import { rogerinhoBurguers } from "./rogerinho-burguers";
import type {
  ActionState,
  ActivityStatus,
  Certainty,
  ClientDemo,
  DataNature,
  DemoArea,
} from "./types";

export type { ClientDemo, DemoArea } from "./types";

export const demos: Record<string, ClientDemo> = {
  [rogerinhoBurguers.slug]: rogerinhoBurguers,
};

export function getDemo(slug: string): ClientDemo | undefined {
  return Object.hasOwn(demos, slug) ? demos[slug] : undefined;
}

/** Ordem da visita guiada. */
export const demoAreas: { id: DemoArea; label: string; short: string }[] = [
  { id: "visao-geral", label: "Visão geral", short: "Visão geral" },
  { id: "diagnostico", label: "Diagnóstico digital", short: "Diagnóstico" },
  { id: "atividades", label: "Atividades", short: "Atividades" },
  { id: "presenca-digital", label: "Presença digital", short: "Presença" },
  { id: "publicacoes", label: "Publicações", short: "Publicações" },
  { id: "aprovacoes", label: "Aprovações", short: "Aprovações" },
  { id: "pesquisas-e-avaliacoes", label: "Pesquisas e avaliações", short: "Pesquisas" },
  { id: "proximas-acoes", label: "Próximas ações", short: "Próximas" },
  { id: "proposta-e-estrategia", label: "Proposta e estratégia", short: "Estratégia" },
];

export function areaIndex(area: DemoArea) {
  return demoAreas.findIndex((a) => a.id === area);
}

export function isDemoArea(value: string): value is DemoArea {
  return demoAreas.some((a) => a.id === value);
}

export const demoCopy = {
  product: "Central de Presença Digital",
  indexTitle: "Demonstrações guiadas",
  indexIntro:
    "Veja como a Aruá transforma um diagnóstico de presença digital em um acompanhamento organizado, visual e transparente para o cliente.",
  start: "Iniciar demonstração",
  entryNotice:
    "Experiência demonstrativa baseada no diagnóstico inicial de 31/10/2026. Não há login: nada do que você fizer aqui é salvo ou enviado.",
  entryPurpose:
    "É assim que o proprietário acompanha, pelo celular, o trabalho de presença digital: o que foi encontrado, o que está planejado, o que precisa da decisão dele e como medimos.",
  panelNotice: "Demonstração guiada · dados do diagnóstico de 31/10/2026 · nada é salvo",
  guide: {
    title: "Orientação",
    represents: "O que esta área representa",
    problem: "Qual problema resolve",
    howAruaUses: "Como a Aruá usa no acompanhamento",
    whatIsReal: "O que é real aqui",
    previous: "Anterior",
    next: "Próxima área",
    finish: "Concluir visita",
    close: "Encerrar orientação",
    reopen: "Mostrar orientação",
    progress: (step: number, total: number) => `Etapa ${step} de ${total}`,
    finished:
      "Visita concluída. Continue navegando pelas áreas ou volte à visão geral quando quiser.",
  },
  backToOverview: "Voltar à visão geral",
  exit: "Sair da demonstração",
  areasNav: "Áreas da Central",
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

export const actionStateLabels: Record<ActionState, string> = {
  proposta: "Ação proposta",
  "aguardando-confirmacao": "Aguardando confirmação",
  "depende-acesso": "Depende de acesso",
  "depende-autorizacao": "Depende de autorização",
  realizada: "Realizada",
};

export const CONCEPT_LABEL = "Exemplo conceitual — não publicado";

/** 2026-10-31 → 31/10/2026 (sem fuso: a data é um dia do calendário, não um instante). */
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function formatNumber(value: number, decimals = 0) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

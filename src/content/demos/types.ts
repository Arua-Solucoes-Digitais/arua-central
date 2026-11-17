// Contrato das demonstrações guiadas da Central de Presença Digital.
// Cada cliente é um arquivo de dados neste diretório; as telas (src/components/demos)
// e as rotas (/demonstracoes/$client) são as mesmas para todos.
// Regra: tudo aqui é público. Nada de PIN, senha, token, telefone de consumidor,
// conversa, dado de banco ou número que não tenha fonte e data.

/** Natureza de um dado. Nunca misture: cada valor exibido tem exatamente uma. */
export type DataNature = "real" | "estimativa" | "simulacao";

/** Grau de certeza de uma informação do diagnóstico. */
export type Certainty = "verificado" | "hipotese" | "pendente";

/** Status de atividade, iguais aos do projeto original (sem "concluído" sem evidência). */
export type ActivityStatus =
  "planejado" | "andamento" | "aguardando" | "aprovado" | "concluido" | "ajustes";

/** Situação de uma próxima ação. "realizada" só com evidência registrada. */
export type ActionState =
  "proposta" | "aguardando-confirmacao" | "depende-acesso" | "depende-autorizacao" | "realizada";

export type DemoArea =
  | "visao-geral"
  | "diagnostico"
  | "atividades"
  | "presenca-digital"
  | "publicacoes"
  | "aprovacoes"
  | "pesquisas-e-avaliacoes"
  | "proximas-acoes"
  | "proposta-e-estrategia";

export type SourceLink = { label: string; url: string; note?: string };

export type Indicator = {
  id: string;
  channel: string;
  label: string;
  explain: string;
  /** null = ainda não disponível (sem acesso ao painel, por exemplo). */
  value: number | null;
  decimals?: number;
  /** Data de referência no formato AAAA-MM-DD; obrigatória quando há valor. */
  referenceDate: string | null;
  source: string;
  /** null junto com value null: não há dado, então não há natureza. */
  nature: DataNature | null;
  /** Por que o valor não está disponível, quando value é null. */
  unavailableReason?: string;
};

export type Opportunity = {
  title: string;
  description: string;
  channel: string;
  evidence: string;
  certainty: Certainty;
  recommendation: string;
};

export type Activity = {
  month: 1 | 2;
  category: string;
  title: string;
  description: string;
  objective: string;
  status: ActivityStatus;
  /** Evidências registradas. Atividade "concluido" sem evidência é recusada pelos testes. */
  evidence: string[];
};

export type NextAction = {
  title: string;
  detail: string;
  state: ActionState;
  /** Obrigatório quando state = "realizada". */
  evidence?: string;
};

export type GuideStep = {
  represents: string;
  problem: string;
  howAruaUses: string;
  whatIsReal: string;
  needsBackend: string;
};

export type ConceptPost = {
  title: string;
  format: string;
  channel: string;
  goal: string;
  caption: string;
  nature: "simulacao";
};

export type ApprovalStep = { title: string; detail: string };

export type ScriptItem = { heading: string; text: string };

export type ClientDemo = {
  slug: string;
  /** Classe CSS do tema do cliente em src/styles.css. */
  themeClass: string;
  business: {
    name: string;
    nameVariants: { platform: string; name: string }[];
    segment: string;
    location: string;
    addressNote: string;
    instagramHandle: string;
    links: SourceLink[];
  };
  diagnosis: {
    date: string;
    source: string;
    summary: string;
    projectStatus: string;
    projectStatusDate: string;
    strengths: { title: string; description: string; evidence: string }[];
    opportunities: Opportunity[];
    missingInfo: string[];
    referenceLinks: SourceLink[];
  };
  indicators: Indicator[];
  activities: Activity[];
  activitiesNote: string;
  publications: {
    intro: string;
    realPublications: { title: string; date: string; evidence: string }[];
    noRealPublicationsNote: string;
    concepts: ConceptPost[];
    calendarPrinciples: string[];
  };
  approvals: {
    intro: string;
    steps: ApprovalStep[];
    recordedApprovals: number;
    recordedNote: string;
    sample: { title: string; channel: string; description: string };
  };
  relationship: {
    rules: string[];
    survey: { questions: { question: string; options: string[] }[]; privacy: string };
    reviewScripts: ScriptItem[];
    responsesNote: string;
  };
  nextActions: NextAction[];
  strategy: {
    positioning: string;
    pillars: { title: string; items: string[] }[];
    months: { title: string; description: string }[];
    measurement: string[];
    lasting: string[];
    continuity: { title: string; description: string }[];
    proposalStatus: string;
  };
  guide: Record<DemoArea, GuideStep>;
};

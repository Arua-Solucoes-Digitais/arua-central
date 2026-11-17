// Tlim © Aruá Soluções Digitais · desenvolvido por CjotaDEV7.
// Contrato da demonstração do Tlim: central de pedidos com cardápio online e área do gestor
// (pedidos, CRM, WhatsApp, Instagram, pesquisas, aprovações). Código próprio da Aruá.
// Regra: tudo aqui é público e de exemplo. O restaurante tem nome fictício; clientes, pedidos e
// valores são simulação. Nada de telefone, endereço real ou dado pessoal.

/** Natureza de um dado. Cada valor exibido tem exatamente uma. */
export type DataNature = "real" | "estimativa" | "simulacao";

/** Grau de certeza de uma informação do diagnóstico. */
export type Certainty = "verificado" | "hipotese" | "pendente";

/** Status de um material em aprovação (os mesmos da Central original). */
export type ActivityStatus =
  "planejado" | "andamento" | "aguardando" | "aprovado" | "concluido" | "ajustes";

export type DemoArea =
  | "visao-geral"
  | "pedidos"
  | "cardapio"
  | "crm"
  | "whatsapp"
  | "instagram"
  | "pesquisas"
  | "aprovacoes"
  | "ponto-de-partida";

export type SourceLink = { label: string; url: string; note?: string };

export type Indicator = {
  id: string;
  channel: string;
  label: string;
  explain: string;
  value: number;
  decimals?: number;
  nature: DataNature;
};

export type Opportunity = {
  title: string;
  description: string;
  channel: string;
  certainty: Certainty;
  /** Módulo do Tlim que resolve. */
  solvedBy: DemoArea;
};

export type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  /** Valor de exemplo, em centavos. */
  priceCents: number;
};

export type OrderStatus = "novo" | "preparo" | "saiu" | "concluido";
export type OrderMode = "entrega" | "retirada";
export type Payment = "pix" | "cartao" | "dinheiro";
export type Channel = "cardapio" | "whatsapp" | "instagram";

export type Customer = {
  id: string;
  name: string;
  orders: number;
  spentCents: number;
  /** Dias desde o último pedido. */
  lastOrderDays: number;
  channel: Channel;
};

export type SeedOrder = {
  id: number;
  customerId: string;
  items: { itemId: string; qty: number }[];
  status: OrderStatus;
  minutesAgo: number;
  mode: OrderMode;
  payment: Payment;
  note?: string;
};

export type PostFormat = "Post" | "Reels" | "Stories";
export type SeedPost = {
  id: string;
  format: PostFormat;
  title: string;
  caption: string;
  /** 0 = hoje, 1 = amanhã… */
  dayOffset: number;
  time: string;
};

export type Template = { id: string; label: string; text: string };

export type GuideStep = {
  represents: string;
  problem: string;
  howAruaUses: string;
  whatIsReal: string;
};

export type ClientDemo = {
  slug: string;
  /** Classe CSS do tema do restaurante em src/styles.css. */
  themeClass: string;
  business: {
    name: string;
    initials: string;
    segment: string;
    city: string;
    tagline: string;
    /** Por que o nome é fictício e de onde vêm os números. */
    basis: string;
  };
  presentation: {
    headline: string;
    lead: string;
    problems: { title: string; text: string }[];
    modules: { area: DemoArea; title: string; text: string }[];
  };
  indicators: Indicator[];
  indicatorsNote: string;
  strengths: { title: string; description: string }[];
  opportunities: Opportunity[];
  menu: { categories: string[]; items: MenuItem[] };
  customers: Customer[];
  orders: SeedOrder[];
  posts: SeedPost[];
  templates: Template[];
  survey: { questions: { question: string; options: string[] }[]; privacy: string };
  reviewRules: string[];
  approvals: {
    intro: string;
    steps: { title: string; detail: string }[];
    sample: { title: string; channel: string; description: string };
  };
  guide: Record<DemoArea, GuideStep>;
};

// Regras dos dados, usadas no formulário (mensagem clara) e no servidor (a validação que vale).
import { z } from "zod";

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:" && !/\s/.test(value);
  } catch {
    return false;
  }
}

// Link de demonstração: endereço https ou uma página deste próprio site, como /hospedagens/demonstracao.
function isDemoLink(value: string) {
  return value === "" || isHttpsUrl(value) || /^\/(?!\/)[^\s]*$/.test(value);
}

const slugField = z
  .string()
  .trim()
  .max(80, "Use até 80 caracteres")
  .regex(/^$|^[a-z0-9]+(-[a-z0-9]+)*$/, "Use só letras minúsculas, números e hífens");

const statusField = z.enum(["draft", "published", "archived"]);
export type PublicationStatus = z.output<typeof statusField>;

export const baseProjectSchema = z.object({
  title: z.string().trim().min(1, "Informe o nome do projeto").max(80, "Use até 80 caracteres"),
  slug: slugField,
  description: z.string().trim().min(1, "Descreva o projeto").max(300, "Use até 300 caracteres"),
  problem: z.string().trim().max(800, "Use até 800 caracteres"),
  // Uma funcionalidade por linha. É texto de propósito: nada aqui depende de listas enviadas pelo navegador.
  features: z.string().trim().max(2000, "Use até 2000 caracteres"),
  demo_url: z
    .string()
    .trim()
    .max(500, "Use até 500 caracteres")
    .refine(
      isDemoLink,
      "Use um endereço https:// completo ou uma página deste site, começando com /",
    ),
  sort_order: z.coerce
    .number({ error: "Informe um número" })
    .int("Use um número inteiro")
    .min(0, "Use um número de 0 a 9999")
    .max(9999, "Use um número de 0 a 9999"),
  status: statusField,
  kind: z.enum(["product", "case"]),
  category: z.enum(["site", "aplicacao", "sistema", "social", "audiovisual"]),
  client: z.string().trim().max(120, "Use até 120 caracteres"),
  // Resultados reais e comprováveis, um por linha. Nunca números estimados.
  results: z.string().trim().max(2000, "Use até 2000 caracteres"),
});

export type ProjectKind = BaseProjectInput["kind"];
export type ProjectCategory = BaseProjectInput["category"];

const httpsField = (required: boolean) =>
  z
    .string()
    .trim()
    .max(500, "Use até 500 caracteres")
    .refine(
      (v) => (v === "" ? !required : isHttpsUrl(v) && !new URL(v).username),
      "Use o endereço completo, começando com https://",
    );

export const deploymentSchema = z.object({
  project_id: z.string().uuid("Escolha o projeto"),
  environment: z.enum(["production", "demo", "staging"]),
  url: httpsField(true),
  health_url: httpsField(false),
  host: z.string().trim().max(80, "Use até 80 caracteres"),
  mode: z.enum(["planned", "active", "maintenance"]),
  is_public: z.boolean(),
  notes: z.string().trim().max(500, "Use até 500 caracteres"),
});

export const testimonialSchema = z.object({
  author: z
    .string()
    .trim()
    .min(1, "Informe quem deu o depoimento")
    .max(100, "Use até 100 caracteres"),
  role: z.string().trim().max(120, "Use até 120 caracteres"),
  quote: z.string().trim().min(1, "Escreva o depoimento").max(600, "Use até 600 caracteres"),
  project_id: z.union([z.literal(""), z.string().uuid()]),
  authorized: z.boolean(),
  status: statusField,
  sort_order: z.coerce
    .number({ error: "Informe um número" })
    .int("Use um número inteiro")
    .min(0, "Use um número de 0 a 9999")
    .max(9999, "Use um número de 0 a 9999"),
});

export const propertySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(120, "Use até 120 caracteres"),
  slug: slugField,
  description: z.string().trim().max(3000, "Use até 3000 caracteres"),
  amenities: z.string().trim().max(2000, "Use até 2000 caracteres"),
  instagram: z.string().trim().max(100, "Use até 100 caracteres"),
  address: z.string().trim().max(300, "Use até 300 caracteres"),
  maps_url: z
    .string()
    .trim()
    .max(500, "Use até 500 caracteres")
    .refine((v) => v === "" || isHttpsUrl(v), "Use o link completo, começando com https://"),
  whatsapp: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine(
      (v) => v === "" || (v.length >= 10 && v.length <= 15),
      "Use DDI, DDD e número, como 55 11 91234-5678",
    ),
  status: statusField,
  is_demo: z.boolean(),
});

const timeField = z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, "Use o formato 14:00");

export const staySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(80, "Use até 80 caracteres"),
  description: z.string().trim().max(1000, "Use até 1000 caracteres"),
  capacity: z
    .string()
    .trim()
    .regex(/^$|^[1-9]\d{0,2}$/, "Use um número de 1 a 500")
    .refine((v) => v === "" || Number(v) <= 500, "Use um número de 1 a 500"),
  // Preço em reais, como 350 ou 350,50. Em branco significa "sob consulta".
  price: z
    .string()
    .trim()
    .regex(/^$|^\d{1,7}([.,]\d{1,2})?$/, "Use só o valor, como 350,00"),
  billing: z.string().trim().max(60, "Use até 60 caracteres"),
  rules: z.string().trim().max(1000, "Use até 1000 caracteres"),
  check_in_time: timeField,
  check_out_time: timeField,
  availability: z.enum(["available", "on_request", "unavailable"]),
  availability_note: z.string().trim().max(200, "Use até 200 caracteres"),
  allows_same_day: z.boolean(),
  sort_order: z.coerce
    .number({ error: "Informe um número" })
    .int("Use um número inteiro")
    .min(0, "Use um número de 0 a 9999")
    .max(9999, "Use um número de 0 a 9999"),
});

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha a data");

export const reservationSchema = z.object({
  id: z.string().uuid(),
  property_slug: z.string().max(80),
  stay_id: z.string().uuid("Escolha uma modalidade"),
  check_in: dateField,
  check_out: dateField,
  guests: z.coerce
    .number({ error: "Informe a quantidade" })
    .int("Use um número inteiro")
    .min(1, "Informe pelo menos 1 pessoa")
    .max(500, "Use até 500 pessoas"),
  name: z.string().trim().min(1, "Informe seu nome").max(100, "Use até 100 caracteres"),
  phone: z
    .string()
    .trim()
    .min(8, "Informe um telefone com DDD")
    .max(30, "Use até 30 caracteres")
    .regex(/^[\d\s()+-]+$/, "Use só números"),
  email: z.union([z.literal(""), z.string().trim().email("E-mail inválido").max(255)]),
  notes: z.string().trim().max(1000, "Use até 1000 caracteres"),
  consent: z.boolean().refine((v) => v, "É preciso aceitar para continuar"),
});

export const reservationStatusSchema = z.enum(["new", "contacted", "confirmed", "declined"]);

export const mediaUpdateSchema = z.object({
  id: z.string().uuid(),
  alt: z.string().trim().max(200, "Use até 200 caracteres"),
  description: z.string().trim().max(300, "Use até 300 caracteres"),
});

export const contactTopicSchema = z.enum(["orcamento", "teste", "reuniao", "suporte", "outro"]);
export type ContactTopic = z.output<typeof contactTopicSchema>;

export const contactSchema = z.object({
  topic: contactTopicSchema.default("orcamento"),
  name: z.string().trim().min(1, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(1, "Escreva sua mensagem").max(2000),
  consent: z.boolean().refine((v) => v, "É preciso aceitar para enviar"),
});

export const analyticsSchema = z.object({
  event_type: z.enum(["pageview", "click"]),
  path: z.string().max(200),
  label: z.string().max(100).nullable(),
  device: z.enum(["mobile", "desktop"]),
});

export const loginSchema = z.object({
  email: z.string().max(255),
  password: z.string().max(200),
});

export const idSchema = z.string().uuid();

export type BaseProjectInput = z.output<typeof baseProjectSchema>;
export type PropertyInput = z.output<typeof propertySchema>;
export type StayInput = z.output<typeof staySchema>;
export type ReservationInput = z.output<typeof reservationSchema>;
export type ReservationStatus = z.output<typeof reservationStatusSchema>;
export type ContactInput = z.output<typeof contactSchema>;
export type DeploymentInput = z.output<typeof deploymentSchema>;
export type TestimonialInput = z.output<typeof testimonialSchema>;
export type AnalyticsInput = z.output<typeof analyticsSchema>;

// Resultado de uma ação que pode ser recusada por um motivo que a pessoa consegue corrigir.
export type ActionResult<T = object> =
  ({ ok: true } & T) | { ok: false; field: string; message: string };

export type MediaRole = "cover" | "logo" | "banner" | "gallery" | "stay";
export type MediaItem = {
  id: string;
  role: MediaRole;
  kind: "image" | "video";
  alt: string;
  description: string;
  stay_id: string | null;
  // Só na demonstração estática: arquivo versionado em src/demo/properties, no lugar de /media/<id>.
  src?: string;
};

export type PublicBaseProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  demo_url: string | null;
  image_id: string | null;
  kind: ProjectKind;
  category: ProjectCategory;
  client: string;
};
export type ProjectPage = PublicBaseProject & {
  problem: string;
  features: string[];
  results: string[];
  status: PublicationStatus;
};
export type BaseProject = PublicBaseProject & {
  problem: string;
  features: string;
  results: string;
  status: PublicationStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Stay = {
  id: string;
  name: string;
  description: string;
  capacity: number | null;
  price_cents: number | null;
  billing: string;
  rules: string;
  check_in_time: string;
  check_out_time: string;
  availability: "available" | "on_request" | "unavailable";
  availability_note: string;
  allows_same_day: boolean;
  sort_order: number;
  photos: MediaItem[];
};
export type Property = {
  id: string;
  slug: string;
  name: string;
  description: string;
  amenities: string;
  instagram: string;
  address: string;
  maps_url: string;
  whatsapp: string;
  status: PublicationStatus;
  is_demo: boolean;
};
export type PropertyPage = Property & {
  has_whatsapp: boolean;
  logo: MediaItem | null;
  banners: MediaItem[];
  gallery: MediaItem[];
  stays: Stay[];
};
export type PropertySummary = Pick<Property, "id" | "slug" | "name" | "status" | "is_demo"> & {
  new_requests: number;
};
export type ReservationRequest = {
  id: string;
  stay_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  name: string;
  phone: string;
  email: string | null;
  notes: string;
  status: ReservationStatus;
  whatsapp_opened_at: string | null;
  created_at: string;
};
export type ReservationReceipt = {
  message: string;
  whatsapp_url: string;
  stay_name: string;
};
// Situação que o público vê: vem da verificação automática, nunca é digitada à mão.
export type LiveState = "planned" | "maintenance" | "unchecked" | "online" | "offline";
export type Deployment = {
  id: string;
  project_id: string;
  project_title: string;
  environment: DeploymentInput["environment"];
  url: string;
  health_url: string | null;
  host: string;
  mode: DeploymentInput["mode"];
  is_public: boolean;
  notes: string;
  last_checked_at: string | null;
  last_ok: boolean | null;
  last_http_status: number | null;
  last_latency_ms: number | null;
  state: LiveState;
};
export type PublicDeployment = {
  id: string;
  project_slug: string;
  project_title: string;
  environment: DeploymentInput["environment"];
  url: string;
  state: LiveState;
  last_checked_at: string | null;
  // Porcentagem de verificações com resposta nos últimos 30 dias; null sem verificações.
  uptime_30d: number | null;
};
export type Testimonial = {
  id: string;
  author: string;
  role: string;
  quote: string;
  project_id: string | null;
  authorized: boolean;
  status: PublicationStatus;
  sort_order: number;
};
export type PublicTestimonial = Pick<Testimonial, "id" | "author" | "role" | "quote"> & {
  project_slug: string | null;
  project_title: string | null;
};
export type AdminMessage = {
  id: string;
  topic: ContactTopic;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
};
export type VisitStats = {
  views: number;
  clicks: number;
  mobile: number;
  topClicks: [string, number][];
};

// Substitui src/lib/api.ts SOMENTE no build de demonstração estática (npm run build:demo).
// Não há servidor nem banco: as leituras vêm de snapshot.json (gerado de um banco novo por
// scripts/demo-snapshot.ts) e nada é gravado. O site real continua usando src/lib/api.ts.
import type * as Real from "../lib/api";
import type { z } from "zod";
import type { reservationSchema } from "../lib/schemas";
import { buildReservationMessage, buildWhatsappUrl } from "../lib/whatsapp";
import snapshot from "./snapshot.json";

export type { Showcase } from "../lib/api";

export const DEMO_DISABLED_MESSAGE =
  "Esta é uma demonstração: nada é salvo e a área restrita está desativada.";

type Api = typeof Real;
// Each stand-in keeps the exact type of the real export, so callers compile unchanged.
const stub = <K extends keyof Api>(impl: (...args: never[]) => unknown) =>
  impl as unknown as Api[K];
const disabled = async () => {
  throw new Error(DEMO_DISABLED_MESSAGE);
};
const nothing = async () => undefined;

type Showcase = Real.Showcase;
const showcase = snapshot.showcase as unknown as Showcase;
const projectPages = snapshot.projectPages as unknown as Record<
  string,
  Awaited<ReturnType<Api["getProjectPage"]>>
>;
const propertyPages = snapshot.propertyPages as unknown as Record<
  string,
  Awaited<ReturnType<Api["getPropertyPage"]>>
>;

// Público: leitura do retrato de demonstração
export const getPublishedProjects = stub<"getPublishedProjects">(async () => showcase.projects);
export const getShowcase = stub<"getShowcase">(async () => showcase);
export const fetchShowcase: Api["fetchShowcase"] = async () => showcase;
export const fetchPublishedBaseProjects: Api["fetchPublishedBaseProjects"] = async () =>
  showcase.projects;
export const getProjectPage = stub<"getProjectPage">(
  async ({ data }: { data: { slug: string } }) => projectPages[data.slug] ?? null,
);
export const getPropertyPage = stub<"getPropertyPage">(
  async ({ data }: { data: { slug: string } }) => propertyPages[data.slug] ?? null,
);

// Pedido de reserva: monta o resumo e o link do WhatsApp no navegador, sem gravar nada.
type ReservationInput = z.infer<typeof reservationSchema>;
export const submitReservation = stub<"submitReservation">(
  async ({ data }: { data: ReservationInput }) => {
    const property = propertyPages[data.property_slug];
    const stay = property?.stays.find((s) => s.id === data.stay_id);
    if (!property || !stay) {
      return { ok: false, field: "stay_id", message: "Escolha uma modalidade." };
    }
    if (data.check_out < data.check_in) {
      return { ok: false, field: "check_out", message: "A saída não pode ser antes da entrada." };
    }
    const message = buildReservationMessage({
      propertyName: property.name,
      isDemo: property.is_demo,
      stayName: stay.name,
      checkIn: data.check_in,
      checkOut: data.check_out,
      guests: data.guests,
      name: data.name,
      phone: data.phone,
      email: data.email ?? "",
      notes: data.notes ?? "",
    });
    return {
      ok: true,
      message,
      stay_name: stay.name,
      whatsapp_url: buildWhatsappUrl("", message),
    };
  },
);
export const markReservationOpened = stub<"markReservationOpened">(nothing);

// Contato e métricas: não há onde gravar
export const sendContactMessage = stub<"sendContactMessage">(disabled);
export const recordEvent = stub<"recordEvent">(nothing);

// Área restrita: desativada
export const getCurrentUser = stub<"getCurrentUser">(async () => null);
export const signIn = stub<"signIn">(disabled);
export const signOut = stub<"signOut">(nothing);
export const getDashboard = stub<"getDashboard">(disabled);
export const setMessageRead = stub<"setMessageRead">(disabled);
export const listBaseProjects = stub<"listBaseProjects">(disabled);
export const createBaseProject = stub<"createBaseProject">(disabled);
export const updateBaseProject = stub<"updateBaseProject">(disabled);
export const deleteBaseProject = stub<"deleteBaseProject">(disabled);
export const listProperties = stub<"listProperties">(disabled);
export const getPropertyAdmin = stub<"getPropertyAdmin">(disabled);
export const createProperty = stub<"createProperty">(disabled);
export const updateProperty = stub<"updateProperty">(disabled);
export const saveStay = stub<"saveStay">(disabled);
export const deleteStay = stub<"deleteStay">(disabled);
export const setReservationStatus = stub<"setReservationStatus">(disabled);
export const updateMediaItem = stub<"updateMediaItem">(disabled);
export const moveMediaItem = stub<"moveMediaItem">(disabled);
export const deleteMediaItem = stub<"deleteMediaItem">(disabled);
export const listDeployments = stub<"listDeployments">(disabled);
export const saveDeployment = stub<"saveDeployment">(disabled);
export const deleteDeployment = stub<"deleteDeployment">(disabled);
export const checkDeployments = stub<"checkDeployments">(disabled);
export const listTestimonials = stub<"listTestimonials">(disabled);
export const saveTestimonial = stub<"saveTestimonial">(disabled);
export const deleteTestimonial = stub<"deleteTestimonial">(disabled);

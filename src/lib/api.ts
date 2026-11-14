// Funções que o navegador chama e que rodam só no servidor.
// A permissão é conferida aqui, em cada chamada; esconder botões não protege nada.
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import * as auth from "@/server/auth";
import * as deployments from "@/server/deployments";
import * as hospedagens from "@/server/hospedagens";
import * as media from "@/server/media";
import { allowRequest } from "@/server/rate-limit";
import { clientAddress, isHttpsRequest, SESSION_COOKIE as COOKIE } from "@/server/request";
import * as store from "@/server/store";
import {
  analyticsSchema,
  baseProjectSchema,
  contactSchema,
  deploymentSchema,
  idSchema,
  loginSchema,
  mediaUpdateSchema,
  propertySchema,
  reservationSchema,
  reservationStatusSchema,
  staySchema,
  testimonialSchema,
} from "./schemas";

function requireAdmin() {
  const user = auth.userFromToken(getCookie(COOKIE));
  if (!user) throw new Error("Não autorizado");
  return user;
}

export const getPublishedProjects = createServerFn({ method: "GET" }).handler(() =>
  store.listPublishedProjects(),
);

// Tudo o que as páginas públicas mostram do banco: projetos, sistemas no ar e depoimentos.
export const getShowcase = createServerFn({ method: "GET" }).handler(() => ({
  projects: store.listPublishedProjects(),
  deployments: deployments.listPublicDeployments(),
  testimonials: store.listPublishedTestimonials(),
}));

export type Showcase = Awaited<ReturnType<typeof getShowcase>>;

// Uma falha aqui não pode derrubar a página: o site apenas mostra as seções vazias.
export async function fetchShowcase(): Promise<Showcase> {
  try {
    return await getShowcase();
  } catch (error) {
    console.error("Não foi possível carregar o portfólio:", error);
    return { projects: [], deployments: [], testimonials: [] };
  }
}

export async function fetchPublishedBaseProjects() {
  return (await fetchShowcase()).projects;
}

export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactSchema.parse(data))
  .handler(({ data }) => {
    if (!allowRequest(`contact:${clientAddress()}`, 10, 10 * 60 * 1000)) {
      throw new Error("Muitos envios");
    }
    store.addContactMessage(data);
  });

export const recordEvent = createServerFn({ method: "POST" })
  .validator((data: unknown) => analyticsSchema.parse(data))
  .handler(({ data }) => {
    if (allowRequest(`event:${clientAddress()}`, 120, 60 * 1000)) store.addAnalyticsEvent(data);
  });

export const getCurrentUser = createServerFn({ method: "GET" }).handler(() => {
  const user = auth.userFromToken(getCookie(COOKIE));
  return user ? { email: user.email } : null;
});

export const signIn = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await auth.login(data.email, data.password);
    if (result.status !== "ok") return { status: result.status, email: null };
    setCookie(COOKIE, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttpsRequest(),
      path: "/",
      maxAge: auth.SESSION_MAX_AGE_SECONDS,
    });
    return { status: "ok" as const, email: result.user.email };
  });

export const signOut = createServerFn({ method: "POST" }).handler(() => {
  auth.logout(getCookie(COOKIE));
  deleteCookie(COOKIE, { path: "/" });
});

export const getDashboard = createServerFn({ method: "GET" }).handler(() => {
  requireAdmin();
  return { messages: store.listMessages(), stats: store.visitStats() };
});

export const setMessageRead = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: idSchema, read: z.boolean() }).parse(data))
  .handler(({ data }) => {
    requireAdmin();
    store.setMessageRead(data.id, data.read);
  });

export const listBaseProjects = createServerFn({ method: "GET" }).handler(() => {
  requireAdmin();
  return store.listProjects();
});

const isAdminRequest = () => auth.userFromToken(getCookie(COOKIE)) !== null;
const slugInput = (data: unknown) => z.object({ slug: z.string().max(80) }).parse(data);
const idInput = (data: unknown) => z.object({ id: idSchema }).parse(data);

export const getProjectPage = createServerFn({ method: "GET" })
  .validator(slugInput)
  .handler(({ data }) => {
    const project = store.getProjectPage(data.slug, isAdminRequest());
    if (!project) return null;
    return {
      ...project,
      deployments: deployments
        .listPublicDeployments()
        .filter((d) => d.project_slug === project.slug),
      testimonials: store.listPublishedTestimonials(project.id),
    };
  });

export const createBaseProject = createServerFn({ method: "POST" })
  .validator((data: unknown) => baseProjectSchema.parse(data))
  .handler(({ data }) => store.createProject(requireAdmin().id, data));

export const updateBaseProject = createServerFn({ method: "POST" })
  .validator((data: unknown) => baseProjectSchema.extend({ id: idSchema }).parse(data))
  .handler(({ data: { id, ...project } }) => store.updateProject(requireAdmin().id, id, project));

export const deleteBaseProject = createServerFn({ method: "POST" })
  .validator(idInput)
  .handler(({ data }) => store.deleteProject(requireAdmin().id, data.id));

// Aruá Hospedagens: vitrine
export const getPropertyPage = createServerFn({ method: "GET" })
  .validator(slugInput)
  .handler(({ data }) => hospedagens.getPropertyPage(data.slug, isAdminRequest()));

export const submitReservation = createServerFn({ method: "POST" })
  .validator((data: unknown) => reservationSchema.parse(data))
  .handler(({ data }) => {
    if (!allowRequest(`reservation:${clientAddress()}`, 15, 10 * 60 * 1000)) {
      return {
        ok: false as const,
        field: "form",
        message: "Muitos pedidos em pouco tempo. Aguarde alguns minutos.",
      };
    }
    return hospedagens.createReservation(data);
  });

export const markReservationOpened = createServerFn({ method: "POST" })
  .validator(idInput)
  .handler(({ data }) => hospedagens.markReservationOpened(data.id));

// Aruá Hospedagens: painel
export const listProperties = createServerFn({ method: "GET" }).handler(() => {
  requireAdmin();
  return hospedagens.listProperties();
});

export const getPropertyAdmin = createServerFn({ method: "GET" })
  .validator(idInput)
  .handler(({ data }) => {
    requireAdmin();
    return {
      property: hospedagens.getPropertyForAdmin(data.id),
      reservations: hospedagens.listReservations(data.id),
    };
  });

export const createProperty = createServerFn({ method: "POST" })
  .validator((data: unknown) => propertySchema.parse(data))
  .handler(({ data }) => hospedagens.createProperty(requireAdmin().id, data));

export const updateProperty = createServerFn({ method: "POST" })
  .validator((data: unknown) => propertySchema.extend({ id: idSchema }).parse(data))
  .handler(({ data: { id, ...property } }) =>
    hospedagens.updateProperty(requireAdmin().id, id, property),
  );

export const saveStay = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    staySchema.extend({ property_id: idSchema, id: idSchema.nullable() }).parse(data),
  )
  .handler(({ data: { property_id, id, ...stay } }) =>
    hospedagens.saveStay(requireAdmin().id, property_id, id, stay),
  );

export const deleteStay = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ property_id: idSchema, id: idSchema }).parse(data))
  .handler(({ data }) => hospedagens.deleteStay(requireAdmin().id, data.property_id, data.id));

export const setReservationStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ property_id: idSchema, id: idSchema, status: reservationStatusSchema }).parse(data),
  )
  .handler(({ data }) =>
    hospedagens.setReservationStatus(requireAdmin().id, data.property_id, data.id, data.status),
  );

// Fotos e vídeos. O envio do arquivo fica em src/routes/api.upload.ts.
export const updateMediaItem = createServerFn({ method: "POST" })
  .validator((data: unknown) => mediaUpdateSchema.parse(data))
  .handler(({ data }) => media.updateMedia(requireAdmin().id, data.id, data.alt, data.description));

export const moveMediaItem = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ id: idSchema, direction: z.enum(["up", "down"]) }).parse(data),
  )
  .handler(({ data }) => media.moveMedia(requireAdmin().id, data.id, data.direction));

export const deleteMediaItem = createServerFn({ method: "POST" })
  .validator(idInput)
  .handler(({ data }) => media.deleteMedia(requireAdmin().id, data.id));

// Sistemas no ar (portfólio ao vivo)
export const listDeployments = createServerFn({ method: "GET" }).handler(() => {
  requireAdmin();
  return deployments.listDeployments();
});

export const saveDeployment = createServerFn({ method: "POST" })
  .validator((data: unknown) => deploymentSchema.extend({ id: idSchema.nullable() }).parse(data))
  .handler(({ data: { id, ...input } }) =>
    deployments.saveDeployment(requireAdmin().id, id, input),
  );

export const deleteDeployment = createServerFn({ method: "POST" })
  .validator(idInput)
  .handler(({ data }) => deployments.deleteDeployment(requireAdmin().id, data.id));

// Sem id, verifica todos os sistemas ativos.
export const checkDeployments = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: idSchema.optional() }).parse(data))
  .handler(({ data }) => {
    requireAdmin();
    return deployments.checkDeployments(data.id);
  });

// Depoimentos
export const listTestimonials = createServerFn({ method: "GET" }).handler(() => {
  requireAdmin();
  return store.listTestimonials();
});

export const saveTestimonial = createServerFn({ method: "POST" })
  .validator((data: unknown) => testimonialSchema.extend({ id: idSchema.nullable() }).parse(data))
  .handler(({ data: { id, ...input } }) => store.saveTestimonial(requireAdmin().id, id, input));

export const deleteTestimonial = createServerFn({ method: "POST" })
  .validator(idInput)
  .handler(({ data }) => store.deleteTestimonial(requireAdmin().id, data.id));

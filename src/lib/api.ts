// Funções que o navegador chama e que rodam só no servidor.
// A permissão é conferida aqui, em cada chamada; esconder botões não protege nada.
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import * as auth from "@/server/auth";
import * as store from "@/server/store";
import {
  analyticsSchema,
  baseProjectSchema,
  contactSchema,
  idSchema,
  loginSchema,
} from "./schemas";

const COOKIE = "arua_session";

function requireAdmin() {
  const user = auth.userFromToken(getCookie(COOKIE));
  if (!user) throw new Error("Não autorizado");
  return user;
}

export const getPublishedProjects = createServerFn({ method: "GET" }).handler(() =>
  store.listPublishedProjects(),
);

// Uma falha aqui não pode derrubar a página inicial: o site apenas mostra a seção vazia.
export async function fetchPublishedBaseProjects() {
  try {
    return await getPublishedProjects();
  } catch (error) {
    console.error("Não foi possível carregar os projetos base:", error);
    return [];
  }
}

export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactSchema.parse(data))
  .handler(({ data }) => store.addContactMessage(data));

export const recordEvent = createServerFn({ method: "POST" })
  .validator((data: unknown) => analyticsSchema.parse(data))
  .handler(({ data }) => store.addAnalyticsEvent(data));

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
      secure: new URL(getRequest().url).protocol === "https:",
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

export const createBaseProject = createServerFn({ method: "POST" })
  .validator((data: unknown) => baseProjectSchema.parse(data))
  .handler(({ data }) => store.createProject(requireAdmin().id, data));

export const updateBaseProject = createServerFn({ method: "POST" })
  .validator((data: unknown) => baseProjectSchema.extend({ id: idSchema }).parse(data))
  .handler(({ data: { id, ...project } }) => store.updateProject(requireAdmin().id, id, project));

export const deleteBaseProject = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ id: idSchema }).parse(data))
  .handler(({ data }) => store.deleteProject(requireAdmin().id, data.id));

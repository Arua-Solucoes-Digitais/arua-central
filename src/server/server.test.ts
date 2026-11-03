// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { all, closeDb, get, run } from "./db";
import { login, logout, userFromToken } from "./auth";
import { hashPassword, verifyPassword } from "./password";
import * as store from "./store";

const PASSWORD = "senha-de-teste-123";
const project = {
  title: "Projeto",
  description: "Descrição",
  demo_url: "https://demo.exemplo.com",
  sort_order: 0,
  is_published: false,
};

async function createAdmin() {
  run(
    "insert into users (id, email, password_hash) values ('u1', 'admin@exemplo.com', ?)",
    await hashPassword(PASSWORD),
  );
}

beforeEach(() => {
  vi.stubEnv("ARUA_DB_PATH", ":memory:");
});

afterEach(() => {
  closeDb();
  vi.unstubAllEnvs();
});

describe("senha", () => {
  it("nunca guarda o texto da senha e confere só a senha certa", async () => {
    const hash = await hashPassword(PASSWORD);
    expect(hash).not.toContain(PASSWORD);
    expect(await verifyPassword(PASSWORD, hash)).toBe(true);
    expect(await verifyPassword("outra-senha-qualquer", hash)).toBe(false);
  });
});

describe("login", () => {
  it("abre sessão com a senha certa e encerra ao sair", async () => {
    await createAdmin();
    const result = await login("ADMIN@exemplo.com", PASSWORD);
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(userFromToken(result.token)?.email).toBe("admin@exemplo.com");
    expect(get<{ token_hash: string }>("select token_hash from sessions")?.token_hash).not.toBe(
      result.token,
    );
    logout(result.token);
    expect(userFromToken(result.token)).toBeNull();
  });

  it("responde igual para senha errada e e-mail inexistente", async () => {
    await createAdmin();
    expect(await login("admin@exemplo.com", "senha-errada-123")).toEqual({ status: "invalid" });
    expect(await login("ninguem@exemplo.com", PASSWORD)).toEqual({ status: "invalid" });
  });

  it("bloqueia por 15 minutos depois de 5 erros, mesmo com a senha certa", async () => {
    await createAdmin();
    const now = Date.now();
    for (let i = 0; i < 5; i++) await login("admin@exemplo.com", "senha-errada-123", now);
    expect(await login("admin@exemplo.com", PASSWORD, now)).toEqual({ status: "locked" });
    expect((await login("admin@exemplo.com", PASSWORD, now + 15 * 60 * 1000 + 1)).status).toBe(
      "ok",
    );
  });

  it("recusa sessão vencida, token falso e ausência de token", async () => {
    await createAdmin();
    const now = Date.now();
    const result = await login("admin@exemplo.com", PASSWORD, now);
    if (result.status !== "ok") throw new Error("login falhou");
    expect(userFromToken(result.token, now + 8 * 24 * 60 * 60 * 1000)).toBeNull();
    expect(userFromToken("token-falso")).toBeNull();
    expect(userFromToken(undefined)).toBeNull();
  });
});

describe("projetos base", () => {
  it("mostra ao público só os publicados e sem campos internos", () => {
    store.createProject("u1", project);
    store.createProject("u1", { ...project, title: "Publicado", is_published: true });
    const published = store.listPublishedProjects();
    expect(published.map((p) => p.title)).toEqual(["Publicado"]);
    expect(Object.keys(published[0] ?? {}).sort()).toEqual([
      "demo_url",
      "description",
      "id",
      "title",
    ]);
    expect(store.listProjects()).toHaveLength(2);
  });

  it("registra quem criou, alterou e excluiu", () => {
    store.createProject("u1", project);
    const id = store.listProjects()[0]?.id ?? "";
    store.updateProject("u1", id, { ...project, title: "Novo nome" });
    store.deleteProject("u1", id);
    const log = all<{ action: string; actor_id: string; before_data: string | null }>(
      "select action, actor_id, before_data from admin_audit_log order by id",
    );
    expect(log.map((l) => l.action)).toEqual([
      "base_project.create",
      "base_project.update",
      "base_project.delete",
    ]);
    expect(log.every((l) => l.actor_id === "u1")).toBe(true);
    expect(log[2]?.before_data).toContain("Novo nome");
  });

  it("o banco recusa link que não seja https, mesmo sem passar pelo formulário", () => {
    for (const demo_url of ["javascript:alert(1)", "http://a.com", "https://", "https://a b.com"]) {
      expect(() => store.createProject("u1", { ...project, demo_url })).toThrow();
    }
    expect(store.listProjects()).toHaveLength(0);
  });

  it("recusa alterar ou excluir projeto inexistente", () => {
    expect(() => store.updateProject("u1", "nao-existe", project)).toThrow(
      "Projeto não encontrado",
    );
    expect(() => store.deleteProject("u1", "nao-existe")).toThrow("Projeto não encontrado");
  });
});

describe("contato e visitas", () => {
  it("guarda mensagens e alterna a leitura", () => {
    store.addContactMessage({
      name: "Ana",
      email: "ana@exemplo.com",
      message: "Olá",
      consent: true,
    });
    const message = store.listMessages()[0];
    expect(message).toMatchObject({ name: "Ana", phone: null, read: false });
    store.setMessageRead(message?.id ?? "", true);
    expect(store.listMessages()[0]?.read).toBe(true);
  });

  it("soma visitas e cliques dos últimos 30 dias", () => {
    store.addAnalyticsEvent({ event_type: "pageview", path: "/", label: null, device: "mobile" });
    store.addAnalyticsEvent({ event_type: "pageview", path: "/", label: null, device: "desktop" });
    store.addAnalyticsEvent({
      event_type: "click",
      path: "/",
      label: "contato",
      device: "desktop",
    });
    run(
      "update analytics_events set created_at = '2000-01-01T00:00:00.000Z' where device = 'mobile'",
    );
    expect(store.visitStats()).toEqual({
      views: 1,
      clicks: 1,
      mobile: 0,
      topClicks: [["contato", 1]],
    });
  });

  it("devolve zeros com o banco vazio", () => {
    expect(store.visitStats()).toEqual({ views: 0, clicks: 0, mobile: 0, topClicks: [] });
  });
});

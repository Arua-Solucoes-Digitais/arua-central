// @vitest-environment node
import { randomUUID } from "node:crypto";
import { copyFileSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { slugify } from "../lib/slug";
import { all, closeDb, get, MIGRATIONS, run, uploadsDir } from "./db";
import { login, logout, userFromToken } from "./auth";
import * as deployments from "./deployments";
import * as hospedagens from "./hospedagens";
import * as media from "./media";
import { importProperty } from "./property-import";
import { hashPassword, verifyPassword } from "./password";
import { allowRequest, resetRateLimit } from "./rate-limit";
import * as store from "./store";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const MP4 = new Uint8Array([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);

const PASSWORD = "senha-de-teste-123";
const project = {
  title: "Projeto",
  description: "Descrição",
  slug: "",
  problem: "",
  features: "",
  demo_url: "https://demo.exemplo.com",
  sort_order: 0,
  status: "draft" as const,
  kind: "product" as const,
  category: "sistema" as const,
  client: "",
  results: "",
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
  const before = () => store.listPublishedProjects().map((p) => p.title);

  it("publica, despublica e arquiva, refletindo na listagem pública", () => {
    const created = store.createProject("u1", project);
    if (!created.ok) throw new Error(created.message);
    expect(before()).not.toContain("Projeto");
    expect(store.getProjectPage("projeto", false)).toBeNull();
    expect(store.getProjectPage("projeto", true)?.status).toBe("draft");

    expect(store.updateProject("u1", created.id, { ...project, status: "published" }).ok).toBe(
      true,
    );
    expect(before()).toContain("Projeto");
    expect(store.getProjectPage("projeto", false)?.title).toBe("Projeto");

    expect(store.updateProject("u1", created.id, { ...project, status: "draft" }).ok).toBe(true);
    expect(before()).not.toContain("Projeto");

    expect(store.updateProject("u1", created.id, { ...project, status: "archived" }).ok).toBe(true);
    expect(before()).not.toContain("Projeto");
    expect(store.getProjectPage("projeto", false)).toBeNull();
  });

  it("mostra ao público só campos públicos", () => {
    store.createProject("u1", { ...project, status: "published" });
    const published = store.listPublishedProjects().find((p) => p.title === "Projeto");
    expect(Object.keys(published ?? {}).sort()).toEqual([
      "category",
      "client",
      "demo_url",
      "description",
      "id",
      "image_id",
      "kind",
      "slug",
      "title",
    ]);
  });

  it("identifica duplicados por nome, endereço e link, mesmo arquivados", () => {
    const first = store.createProject("u1", { ...project, title: "Aruá Teste" });
    if (!first.ok) throw new Error(first.message);
    store.updateProject("u1", first.id, { ...project, title: "Aruá Teste", status: "archived" });
    const otherLink = { ...project, demo_url: "https://outro.exemplo.com" };

    const sameName = store.createProject("u1", { ...otherLink, title: "arua   TESTE" });
    expect(sameName).toMatchObject({ ok: false, field: "title" });
    if (!sameName.ok) expect(sameName.message).toContain("arquivado");
    expect(
      store.createProject("u1", { ...otherLink, title: "Outro", slug: "arua-teste" }),
    ).toMatchObject({
      ok: false,
      field: "slug",
    });
    expect(store.createProject("u1", { ...project, title: "Outro" })).toMatchObject({
      ok: false,
      field: "demo_url",
    });
    expect(store.updateProject("u1", first.id, { ...project, title: "Aruá Teste" }).ok).toBe(true);
  });

  it("registra quem criou, alterou e excluiu", () => {
    const created = store.createProject("u1", project);
    if (!created.ok) throw new Error(created.message);
    store.updateProject("u1", created.id, { ...project, title: "Novo nome" });
    store.deleteProject("u1", created.id);
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

  it("o banco recusa link inseguro e situação inválida, mesmo sem passar pelo formulário", () => {
    for (const demo_url of [
      "javascript:alert(1)",
      "http://a.com",
      "https://",
      "https://a b.com",
      "//a.com",
    ]) {
      expect(() => store.createProject("u1", { ...project, demo_url })).toThrow();
    }
    expect(() => store.createProject("u1", { ...project, status: "apagado" as "draft" })).toThrow();
  });

  it("recusa alterar ou excluir projeto inexistente", () => {
    expect(() => store.updateProject("u1", "nao-existe", project)).toThrow(
      "Projeto não encontrado",
    );
    expect(() => store.deleteProject("u1", "nao-existe")).toThrow("Projeto não encontrado");
  });
});

describe("migração", () => {
  it("preserva acessos e projetos que já existiam e traz a demonstração como rascunho", () => {
    const path = join(mkdtempSync(join(tmpdir(), "arua-")), "v1.db");
    vi.stubEnv("ARUA_DB_PATH", path);
    const old = new DatabaseSync(path);
    old.exec(MIGRATIONS[0] as string);
    old.exec("pragma user_version = 1");
    old.exec(`
      insert into users (id, email, password_hash) values ('u1', 'a@b.com', 'hash');
      insert into base_projects (id, title, description, demo_url, is_published) values
        ('p1', 'Aruá Um', 'Publicado', 'https://a.com', 1),
        ('p2', 'arua um', 'Mesmo nome', 'https://a.com', 0);
      insert into admin_audit_log (action) values ('antigo');
    `);
    old.close();

    const projects = store.listProjects();
    expect(get<{ email: string }>("select email from users")?.email).toBe("a@b.com");
    expect(get<{ action: string }>("select action from admin_audit_log")?.action).toBe("antigo");
    expect(projects.find((p) => p.id === "p1")).toMatchObject({
      status: "published",
      slug: "arua-um",
      demo_url: "https://a.com",
    });
    expect(projects.find((p) => p.id === "p2")).toMatchObject({
      status: "draft",
      slug: "arua-um-2",
      demo_url: null,
    });
    expect(projects.find((p) => p.slug === "arua-hospedagens")?.status).toBe("draft");
    expect(store.listPublishedProjects().map((p) => p.id)).toEqual(["p1"]);
  });

  it("não recria a demonstração se já houver um projeto com o mesmo nome", () => {
    const path = join(mkdtempSync(join(tmpdir(), "arua-")), "v1.db");
    vi.stubEnv("ARUA_DB_PATH", path);
    const old = new DatabaseSync(path);
    old.exec(MIGRATIONS[0] as string);
    old.exec("pragma user_version = 1");
    old.exec(
      `insert into base_projects (id, title, description, demo_url) values ('p1', 'Aruá Hospedagens', 'Meu texto', 'https://a.com')`,
    );
    old.close();
    expect(store.listProjects().map((p) => p.description)).toEqual(["Meu texto"]);
  });
});

const propertyInput = {
  name: "Pousada A",
  slug: "",
  description: "",
  amenities: "",
  instagram: "",
  address: "",
  maps_url: "",
  whatsapp: "5511912345678",
  status: "published" as const,
  is_demo: false,
};
const stayInput = {
  name: "Quarto",
  description: "",
  capacity: "4",
  price: "350,50",
  billing: "por noite",
  rules: "",
  check_in_time: "14:00",
  check_out_time: "12:00",
  availability: "available" as const,
  availability_note: "",
  allows_same_day: false,
  sort_order: 0,
};

function setupProperty(name: string) {
  const created = hospedagens.createProperty("u1", { ...propertyInput, name });
  if (!created.ok) throw new Error(created.message);
  const stay = hospedagens.saveStay("u1", created.id, null, stayInput);
  if (!stay.ok) throw new Error(stay.message);
  return { id: created.id, slug: slugify(name), stayId: stay.id };
}

const request = (slug: string, stayId: string) => ({
  id: randomUUID(),
  property_slug: slug,
  stay_id: stayId,
  check_in: "2030-01-10",
  check_out: "2030-01-12",
  guests: 2,
  name: "Ana",
  phone: "11 91234-5678",
  email: "",
  notes: "",
  consent: true,
});

describe("Aruá Hospedagens", () => {
  it("a demonstração é pública, marcada como fictícia e sem número de WhatsApp", () => {
    const page = hospedagens.getPropertyPage("demonstracao", false);
    expect(page?.is_demo).toBe(true);
    expect(page?.name).toContain("demonstração");
    expect(page?.has_whatsapp).toBe(false);
    expect(page?.stays.map((s) => s.name)).toEqual([
      "Quarto individual",
      "Day use",
      "Fim de semana",
      "Sítio inteiro",
    ]);
  });

  it("estabelecimento real não é publicado sem WhatsApp", () => {
    const result = hospedagens.createProperty("u1", { ...propertyInput, whatsapp: "" });
    expect(result).toMatchObject({ ok: false, field: "whatsapp" });
    expect(
      hospedagens.createProperty("u1", { ...propertyInput, whatsapp: "", status: "draft" }).ok,
    ).toBe(true);
  });

  it("rascunho e arquivado não aparecem para o público nem recebem pedidos", () => {
    const a = setupProperty("Pousada A");
    expect(hospedagens.getPropertyPage(a.slug, false)?.name).toBe("Pousada A");
    hospedagens.updateProperty("u1", a.id, { ...propertyInput, status: "archived" });
    expect(hospedagens.getPropertyPage(a.slug, false)).toBeNull();
    expect(hospedagens.getPropertyPage(a.slug, true)?.status).toBe("archived");
    expect(hospedagens.createReservation(request(a.slug, a.stayId))).toMatchObject({
      ok: false,
      field: "form",
    });
  });

  it("não entrega o número nos dados públicos da vitrine", () => {
    const a = setupProperty("Pousada A");
    const page = hospedagens.getPropertyPage(a.slug, false);
    expect(page?.whatsapp).toBe("");
    expect(page?.has_whatsapp).toBe(true);
  });

  it("gera a mensagem no servidor, com o número do próprio estabelecimento", () => {
    const a = setupProperty("Pousada A");
    const result = hospedagens.createReservation(
      { ...request(a.slug, a.stayId), notes: "Com berço & *urgente*" },
      "2030-01-01",
    );
    if (!result.ok) throw new Error(result.message);
    expect(result.whatsapp_url.startsWith("https://wa.me/5511912345678?text=")).toBe(true);
    const text = decodeURIComponent(result.whatsapp_url.split("text=")[1] ?? "");
    expect(text).toBe(result.message);
    for (const part of [
      "Pousada A",
      "Quarto",
      "10/01/2030",
      "12/01/2030",
      "*Pessoas:* 2",
      "Ana",
      "Com berço & *urgente*",
    ]) {
      expect(text).toContain(part);
    }
    expect(text).not.toMatch(/reserva confirmada/i);
  });

  it("recusa datas, capacidade e modalidade inválidas", () => {
    const a = setupProperty("Pousada A");
    const base = request(a.slug, a.stayId);
    const today = "2030-01-01";
    const cases: [Partial<typeof base>, string][] = [
      [{ check_in: "2029-12-31" }, "check_in"],
      [{ check_in: "2030-02-31", check_out: "2030-03-05" }, "check_in"],
      [{ check_out: "2030-01-09" }, "check_out"],
      [{ check_out: "2030-01-10" }, "check_out"],
      [{ guests: 5 }, "guests"],
      [{ stay_id: randomUUID() }, "stay_id"],
    ];
    for (const [change, field] of cases) {
      expect(hospedagens.createReservation({ ...base, ...change }, today)).toMatchObject({
        ok: false,
        field,
      });
    }
    expect(hospedagens.listReservations(a.id)).toHaveLength(0);
  });

  it("day use aceita o mesmo dia; indisponível não recebe pedido", () => {
    const a = setupProperty("Pousada A");
    const same = hospedagens.saveStay("u1", a.id, null, {
      ...stayInput,
      name: "Day use",
      allows_same_day: true,
    });
    const off = hospedagens.saveStay("u1", a.id, null, {
      ...stayInput,
      name: "Fechado",
      availability: "unavailable",
    });
    if (!same.ok || !off.ok) throw new Error("modalidade");
    expect(
      hospedagens.createReservation(
        { ...request(a.slug, same.id), check_out: "2030-01-10" },
        "2030-01-01",
      ).ok,
    ).toBe(true);
    expect(hospedagens.createReservation(request(a.slug, off.id), "2030-01-01")).toMatchObject({
      ok: false,
      field: "stay_id",
    });
  });

  it("corrigir o pedido atualiza o mesmo registro; depois de aberto no WhatsApp, fica fechado", () => {
    const a = setupProperty("Pousada A");
    const base = request(a.slug, a.stayId);
    hospedagens.createReservation(base, "2030-01-01");
    hospedagens.createReservation({ ...base, guests: 3 }, "2030-01-01");
    expect(hospedagens.listReservations(a.id).map((r) => r.guests)).toEqual([3]);
    hospedagens.markReservationOpened(base.id);
    expect(hospedagens.listReservations(a.id)[0]?.whatsapp_opened_at).toBeTruthy();
    expect(hospedagens.createReservation({ ...base, guests: 1 }, "2030-01-01")).toMatchObject({
      ok: false,
      field: "form",
    });
    expect(hospedagens.listReservations(a.id).map((r) => r.guests)).toEqual([3]);
  });

  it("identifica modalidade repetida no mesmo estabelecimento, mas não entre estabelecimentos", () => {
    const a = setupProperty("Pousada A");
    const b = setupProperty("Pousada B");
    expect(a.stayId).not.toBe(b.stayId);
    expect(hospedagens.saveStay("u1", a.id, null, { ...stayInput, name: "QUARTO" })).toMatchObject({
      ok: false,
      field: "name",
    });
  });
});

describe("isolamento entre clientes", () => {
  it("cada vitrine mostra só os próprios dados", () => {
    const a = setupProperty("Pousada A");
    const b = setupProperty("Pousada B");
    hospedagens.saveStay("u1", b.id, null, { ...stayInput, name: "Só da B" });
    expect(hospedagens.getPropertyPage(a.slug, false)?.stays.map((s) => s.name)).toEqual([
      "Quarto",
    ]);
  });

  it("um pedido não usa a modalidade de outro estabelecimento", () => {
    const a = setupProperty("Pousada A");
    const b = setupProperty("Pousada B");
    expect(hospedagens.createReservation(request(a.slug, b.stayId), "2030-01-01")).toMatchObject({
      ok: false,
      field: "stay_id",
    });
    expect(hospedagens.listReservations(a.id)).toHaveLength(0);
    expect(hospedagens.listReservations(b.id)).toHaveLength(0);
  });

  it("pedidos ficam separados e não mudam de estabelecimento pelo código", () => {
    const a = setupProperty("Pousada A");
    const b = setupProperty("Pousada B");
    const reqA = request(a.slug, a.stayId);
    hospedagens.createReservation(reqA, "2030-01-01");
    expect(hospedagens.listReservations(b.id)).toHaveLength(0);
    // Reaproveitar o código de um pedido em outro estabelecimento não pode alterá-lo.
    expect(
      hospedagens.createReservation({ ...request(b.slug, b.stayId), id: reqA.id }, "2030-01-01"),
    ).toMatchObject({ ok: false });
    expect(hospedagens.listReservations(a.id).map((r) => r.stay_name)).toEqual(["Quarto"]);
    expect(() => hospedagens.setReservationStatus("u1", b.id, reqA.id, "confirmed")).toThrow();
    expect(hospedagens.listReservations(a.id)[0]?.status).toBe("new");
  });

  it("não altera nem exclui modalidade pelo estabelecimento errado", () => {
    const a = setupProperty("Pousada A");
    const b = setupProperty("Pousada B");
    expect(
      hospedagens.saveStay("u1", b.id, a.stayId, { ...stayInput, name: "Invadido" }),
    ).toMatchObject({ ok: false, field: "form" });
    expect(() => hospedagens.deleteStay("u1", b.id, a.stayId)).toThrow();
    expect(hospedagens.getPropertyPage(a.slug, false)?.stays.map((s) => s.name)).toEqual([
      "Quarto",
    ]);
  });

  it("foto de modalidade não entra em outro estabelecimento, nem pelo próprio banco", () => {
    const a = setupProperty("Pousada A");
    const b = setupProperty("Pousada B");
    const result = media.saveMedia(
      "u1",
      { type: "property", id: b.id, stayId: a.stayId },
      "stay",
      PNG,
      "",
      "",
    );
    expect(result).toMatchObject({ ok: false });
    expect(() =>
      run(
        `insert into media (id, property_id, stay_id, role, kind, mime, size, file) values ('x', ?, ?, 'stay', 'image', 'image/png', 1, 'x.png')`,
        b.id,
        a.stayId,
      ),
    ).toThrow();
  });
});

describe("arquivos", () => {
  beforeEach(() => {
    vi.stubEnv("ARUA_UPLOADS_DIR", mkdtempSync(join(tmpdir(), "arua-up-")));
  });

  it("reconhece o tipo pelo conteúdo e recusa o que pode carregar código", () => {
    expect(media.detectFileType(PNG)?.mime).toBe("image/png");
    expect(media.detectFileType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))?.mime).toBe("image/jpeg");
    const text = (value: string) => new TextEncoder().encode(value);
    expect(media.detectFileType(text("<svg onload=alert(1)>"))).toBeNull();
    expect(media.detectFileType(text("<!doctype html><script>"))).toBeNull();
    const a = setupProperty("Pousada A");
    expect(
      media.saveMedia("u1", { type: "property", id: a.id }, "gallery", text("<svg/>"), "", ""),
    ).toMatchObject({ ok: false });
  });

  it("recusa arquivo acima do limite e vídeo fora da galeria", () => {
    const a = setupProperty("Pousada A");
    const big = new Uint8Array(media.IMAGE_MAX_BYTES + 1);
    big.set(PNG);
    expect(
      media.saveMedia("u1", { type: "property", id: a.id }, "gallery", big, "", ""),
    ).toMatchObject({ ok: false });
    expect(
      media.saveMedia("u1", { type: "property", id: a.id }, "logo", MP4, "", ""),
    ).toMatchObject({ ok: false });
    expect(
      media.saveMedia("u1", { type: "property", id: a.id }, "gallery", MP4, "", ""),
    ).toMatchObject({ ok: true });
  });

  it("logotipo novo substitui o anterior e remove o arquivo; a ordem da galeria muda", () => {
    const a = setupProperty("Pousada A");
    const target = { type: "property" as const, id: a.id };
    const first = media.saveMedia("u1", target, "logo", PNG, "", "");
    const second = media.saveMedia("u1", target, "logo", PNG, "", "");
    if (!first.ok || !second.ok) throw new Error("envio");
    expect(hospedagens.getPropertyPage(a.slug, false)?.logo?.id).toBe(second.id);
    expect(media.findMedia(first.id)).toBeNull();
    expect(readdirSync(uploadsDir())).toEqual([`${second.id}.png`]);

    const g1 = media.saveMedia("u1", target, "gallery", PNG, "1", "");
    const g2 = media.saveMedia("u1", target, "gallery", PNG, "2", "");
    if (!g1.ok || !g2.ok) throw new Error("envio");
    media.moveMedia("u1", g2.id, "up");
    expect(hospedagens.getPropertyPage(a.slug, false)?.gallery.map((m) => m.alt)).toEqual([
      "2",
      "1",
    ]);
  });

  it("arquivo de rascunho não é público; o publicado é", () => {
    const a = setupProperty("Pousada A");
    const item = media.saveMedia("u1", { type: "property", id: a.id }, "gallery", PNG, "", "");
    if (!item.ok) throw new Error("envio");
    expect(media.findMedia(item.id)?.isPublic).toBe(true);
    hospedagens.updateProperty("u1", a.id, { ...propertyInput, status: "draft" });
    expect(media.findMedia(item.id)?.isPublic).toBe(false);
  });

  it("excluir modalidade e projeto também remove os arquivos deles", () => {
    const a = setupProperty("Pousada A");
    media.saveMedia("u1", { type: "property", id: a.id, stayId: a.stayId }, "stay", PNG, "", "");
    const created = store.createProject("u1", project);
    if (!created.ok) throw new Error(created.message);
    media.saveMedia("u1", { type: "project", id: created.id }, "cover", PNG, "", "");
    expect(readdirSync(uploadsDir())).toHaveLength(2);
    hospedagens.deleteStay("u1", a.id, a.stayId);
    store.deleteProject("u1", created.id);
    expect(readdirSync(uploadsDir())).toHaveLength(0);
  });
});

describe("limite de envios", () => {
  it("bloqueia acima do limite e libera depois da janela", () => {
    resetRateLimit();
    expect(allowRequest("k", 2, 1000, 0)).toBe(true);
    expect(allowRequest("k", 2, 1000, 1)).toBe(true);
    expect(allowRequest("k", 2, 1000, 2)).toBe(false);
    expect(allowRequest("outro", 2, 1000, 2)).toBe(true);
    expect(allowRequest("k", 2, 1000, 1002)).toBe(true);
  });
});

describe("contato e visitas", () => {
  it("guarda mensagens e alterna a leitura", () => {
    store.addContactMessage({
      topic: "orcamento",
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

function publishedProject(title: string, status: "draft" | "published" = "published") {
  const created = store.createProject("u1", { ...project, title, demo_url: "", status });
  if (!created.ok) throw new Error(created.message);
  return created.id;
}

const deploymentInput = (project_id: string) => ({
  project_id,
  environment: "production" as const,
  url: "https://sistema.exemplo.com",
  health_url: "",
  host: "VPS",
  mode: "active" as const,
  is_public: true,
  notes: "",
});

const fakeFetch = (status: number | "error") =>
  (async () => {
    if (status === "error") throw new TypeError("fetch failed");
    return new Response(null, { status });
  }) as unknown as typeof fetch;

describe("sistemas no ar", () => {
  it("só mostra ao público sistemas públicos de projetos publicados", () => {
    const pub = publishedProject("Publicado");
    const draft = publishedProject("Rascunho", "draft");
    deployments.saveDeployment("u1", null, deploymentInput(pub));
    deployments.saveDeployment("u1", null, deploymentInput(draft));
    deployments.saveDeployment("u1", null, {
      ...deploymentInput(pub),
      environment: "staging",
      is_public: false,
    });
    expect(
      deployments.listPublicDeployments().map((d) => [d.project_title, d.environment]),
    ).toEqual([["Publicado", "production"]]);
  });

  it("um ambiente por projeto e só endereços https, também no banco", () => {
    const id = publishedProject("Projeto A");
    expect(deployments.saveDeployment("u1", null, deploymentInput(id)).ok).toBe(true);
    const again = deployments.saveDeployment("u1", null, deploymentInput(id));
    expect(again).toMatchObject({ ok: false, field: "environment" });
    expect(() =>
      run(
        "insert into deployments (id, project_id, environment, url) values ('x', ?, 'demo', 'http://inseguro.com')",
        id,
      ),
    ).toThrow();
  });

  it("a situação vem da verificação: no ar, fora do ar, planejado e manutenção", async () => {
    const id = publishedProject("Projeto B");
    const saved = deployments.saveDeployment("u1", null, deploymentInput(id));
    if (!saved.ok) throw new Error(saved.message);
    expect(deployments.listPublicDeployments()[0]?.state).toBe("unchecked");

    await deployments.checkDeployments(undefined, fakeFetch(200));
    expect(deployments.listPublicDeployments()[0]).toMatchObject({
      state: "online",
      uptime_30d: 100,
    });

    await deployments.checkDeployments(undefined, fakeFetch(503));
    expect(deployments.listPublicDeployments()[0]).toMatchObject({
      state: "offline",
      uptime_30d: 50,
    });

    await deployments.checkDeployments(undefined, fakeFetch("error"));
    expect(deployments.listDeployments()[0]).toMatchObject({
      last_ok: false,
      last_http_status: null,
    });

    deployments.saveDeployment("u1", saved.id, { ...deploymentInput(id), mode: "maintenance" });
    expect(deployments.listPublicDeployments()[0]?.state).toBe("maintenance");
    // Em manutenção não é verificado.
    expect(await deployments.checkDeployments(undefined, fakeFetch(200))).toEqual([]);
  });

  it("trocar o endereço apaga a verificação antiga", async () => {
    const id = publishedProject("Projeto C");
    const saved = deployments.saveDeployment("u1", null, deploymentInput(id));
    if (!saved.ok) throw new Error(saved.message);
    await deployments.checkDeployments(saved.id, fakeFetch(200));
    deployments.saveDeployment("u1", saved.id, {
      ...deploymentInput(id),
      url: "https://novo.exemplo.com",
    });
    expect(deployments.listPublicDeployments()[0]).toMatchObject({
      state: "unchecked",
      uptime_30d: null,
    });
  });

  it("excluir o projeto remove os sistemas dele", () => {
    const id = publishedProject("Projeto D");
    deployments.saveDeployment("u1", null, deploymentInput(id));
    store.deleteProject("u1", id);
    expect(deployments.listDeployments()).toEqual([]);
  });

  it("redirecionamento conta como no ar; erro 4xx não", async () => {
    expect((await deployments.probe("https://a.com", fakeFetch(301))).ok).toBe(true);
    expect((await deployments.probe("https://a.com", fakeFetch(404))).ok).toBe(false);
  });
});

const testimonialInput = {
  author: "Maria",
  role: "Dona da Pousada X",
  quote: "Atendimento excelente.",
  project_id: "",
  authorized: true,
  status: "published" as const,
  sort_order: 0,
};

describe("depoimentos", () => {
  it("não publica sem autorização de quem falou, nem pelo próprio banco", () => {
    expect(
      store.saveTestimonial("u1", null, { ...testimonialInput, authorized: false }),
    ).toMatchObject({ ok: false, field: "authorized" });
    expect(() =>
      run(
        "insert into testimonials (id, author, quote, authorized, status) values ('t', 'A', 'B', 0, 'published')",
      ),
    ).toThrow();
  });

  it("o público vê só os publicados, e o projeto citado só se estiver publicado", () => {
    const draft = publishedProject("Rascunho", "draft");
    store.saveTestimonial("u1", null, { ...testimonialInput, project_id: draft });
    store.saveTestimonial("u1", null, { ...testimonialInput, author: "Oculto", status: "draft" });
    expect(store.listPublishedTestimonials()).toEqual([
      expect.objectContaining({ author: "Maria", project_slug: null, project_title: null }),
    ]);
  });
});

describe("migração 3", () => {
  it("projetos antigos viram produtos e mensagens antigas viram pedido de orçamento", () => {
    const path = join(mkdtempSync(join(tmpdir(), "arua-")), "v2.db");
    vi.stubEnv("ARUA_DB_PATH", path);
    const old = new DatabaseSync(path);
    old.exec(MIGRATIONS[0] as string);
    (MIGRATIONS[1] as (db: DatabaseSync) => void)(old);
    old.exec("pragma user_version = 2");
    old.exec(
      "insert into contact_messages (id, name, email, message, consent) values ('m1', 'Ana', 'a@b.com', 'Oi', 1)",
    );
    old.close();
    expect(store.listProjects().find((p) => p.slug === "arua-hospedagens")).toMatchObject({
      kind: "product",
      category: "sistema",
    });
    expect(store.listMessages()[0]?.topic).toBe("orcamento");
  });
});

describe("importação de vitrine", () => {
  const ENCANTO = "public/demos/encanto-da-mata";
  beforeEach(() => {
    vi.stubEnv("ARUA_UPLOADS_DIR", mkdtempSync(join(tmpdir(), "arua-up-")));
  });

  it("cria a vitrine do Encanto com modalidades e fotos do próprio estabelecimento", () => {
    const { id, slug, mediaFiles } = importProperty(ENCANTO, "script:test");
    const page = hospedagens.getPropertyPage(slug, false);
    expect(page?.is_demo).toBe(true);
    // Demonstração: o número é o da Aruá, e o visitante não o recebe na página.
    expect(page?.has_whatsapp).toBe(true);
    expect(page?.whatsapp).toBe("");
    expect(
      get<{ whatsapp: string }>("select whatsapp from properties where id = ?", id)?.whatsapp,
    ).toBe("5538999636208");
    expect(page?.banners).toHaveLength(1);
    expect(page?.gallery.some((m) => m.kind === "video")).toBe(true);
    expect(page?.stays.map((s) => [s.name, s.photos.length])).toEqual([
      ["Suíte Master", 1],
      ["Suíte na Natureza", 1],
      ["Quarto Quádruplo", 1],
    ]);
    expect(Object.values(mediaFiles)).toContain("encanto-da-mata/img/deck-rede.jpg");
    expect(
      get<{ n: number }>("select count(*) as n from media where property_id <> ?", id)?.n,
    ).toBe(0);
    expect(readdirSync(uploadsDir())).toHaveLength(14);
  });

  it("não substitui um estabelecimento que já existe", () => {
    importProperty(ENCANTO, "script:test");
    expect(() => importProperty(ENCANTO, "script:test")).toThrow(/Já existe/);
    expect(
      get<{ n: number }>("select count(*) as n from properties where slug = 'encanto-da-mata'")?.n,
    ).toBe(1);
  });

  it("um arquivo inválido desfaz a importação inteira", () => {
    const dir = mkdtempSync(join(tmpdir(), "arua-seed-"));
    copyFileSync(join(ENCANTO, "img", "deck-rede.jpg"), join(dir, "deck-rede.jpg"));
    writeFileSync(join(dir, "falso.jpg"), "<svg onload=alert(1)>");
    writeFileSync(
      join(dir, "property.json"),
      JSON.stringify({
        property: { ...propertyInput, slug: "teste-importacao" },
        stays: [{ ...stayInput, key: "a" }],
        media: [
          { file: "deck-rede.jpg", role: "banner", alt: "", description: "" },
          { file: "falso.jpg", role: "gallery", alt: "", description: "" },
        ],
      }),
    );
    expect(() => importProperty(dir, "script:test")).toThrow(/falso\.jpg/);
    expect(get("select id from properties where slug = 'teste-importacao'")).toBeUndefined();
    expect(readdirSync(uploadsDir())).toEqual([]);
  });

  it("recusa arquivo fora da pasta do estabelecimento", () => {
    const dir = mkdtempSync(join(tmpdir(), "arua-seed-"));
    writeFileSync(
      join(dir, "property.json"),
      JSON.stringify({
        property: { ...propertyInput, slug: "teste-caminho" },
        stays: [],
        media: [{ file: "../arua.db", role: "gallery", alt: "", description: "" }],
      }),
    );
    expect(() => importProperty(dir, "script:test")).toThrow();
    expect(get("select id from properties where slug = 'teste-caminho'")).toBeUndefined();
  });
});

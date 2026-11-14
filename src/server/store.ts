import { randomUUID } from "node:crypto";
import type {
  ActionResult,
  AdminMessage,
  AnalyticsInput,
  BaseProject,
  BaseProjectInput,
  ContactInput,
  ProjectPage,
  PublicBaseProject,
  PublicTestimonial,
  Testimonial,
  TestimonialInput,
  VisitStats,
} from "../lib/schemas.ts";
import { slugify } from "../lib/slug.ts";
import { all, get, run, transaction } from "./db.ts";
import { listMediaFiles, removeFiles } from "./media.ts";

type MessageRow = Omit<AdminMessage, "read"> & { read: number };

const IMAGE_ID = `(select media.id from media where media.project_id = base_projects.id and media.role = 'cover' limit 1) as image_id`;

export function audit(
  actorId: string,
  action: string,
  targetId: string,
  before: unknown,
  after: unknown,
) {
  run(
    "insert into admin_audit_log (actor_id, action, target_id, before_data, after_data) values (?, ?, ?, ?, ?)",
    actorId,
    action,
    targetId,
    before === null ? null : JSON.stringify(before),
    after === null ? null : JSON.stringify(after),
  );
}

export function listPublishedProjects() {
  return all<PublicBaseProject>(
    `select id, slug, title, description, demo_url, kind, category, client, ${IMAGE_ID} from base_projects
     where status = 'published' order by sort_order, created_at`,
  );
}

export function listProjects() {
  return all<BaseProject>(
    `select id, slug, title, description, problem, features, demo_url, status, sort_order, published_at,
       kind, category, client, results, created_at, updated_at, ${IMAGE_ID}
     from base_projects order by status = 'archived', sort_order, created_at`,
  );
}

// Rascunhos e arquivados só abrem para quem está conectado ao painel, como pré-visualização.
export function getProjectPage(slug: string, isAdmin: boolean): ProjectPage | null {
  const row = get<
    Omit<ProjectPage, "features" | "results"> & { features: string; results: string }
  >(
    `select id, slug, title, description, problem, features, results, demo_url, status,
       kind, category, client, ${IMAGE_ID}
     from base_projects where slug = ?`,
    slug,
  );
  if (!row || (row.status !== "published" && !isAdmin)) return null;
  return { ...row, features: lines(row.features), results: lines(row.results) };
}

const lines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

function findProject(id: string) {
  const row = get<BaseProject>("select * from base_projects where id = ?", id);
  if (!row) throw new Error("Projeto não encontrado");
  return row;
}

// Compara sem acentos nem maiúsculas: "Aruá Hospedagens" e "arua hospedagens" são o mesmo projeto.
function findDuplicate(input: BaseProjectInput, slug: string, ignoreId: string) {
  if (!slug) return { field: "title", message: "Use um nome com letras ou números." };
  const titleKey = slugify(input.title);
  const others = all<{
    title: string;
    slug: string;
    title_key: string;
    demo_url: string | null;
    status: string;
  }>("select title, slug, title_key, demo_url, status from base_projects where id <> ?", ignoreId);
  const archivedHint = (status: string) => (status === "archived" ? " (arquivado)" : "");
  const sameTitle = others.find((p) => p.title_key === titleKey);
  if (sameTitle) {
    return {
      field: "title",
      message: `Já existe o projeto "${sameTitle.title}"${archivedHint(sameTitle.status)}. Edite o que já existe.`,
    };
  }
  const sameSlug = others.find((p) => p.slug === slug);
  if (sameSlug) {
    return {
      field: "slug",
      message: `Este endereço já é usado por "${sameSlug.title}"${archivedHint(sameSlug.status)}.`,
    };
  }
  const sameLink = input.demo_url ? others.find((p) => p.demo_url === input.demo_url) : undefined;
  if (sameLink) {
    return {
      field: "demo_url",
      message: `Este link já é usado por "${sameLink.title}"${archivedHint(sameLink.status)}.`,
    };
  }
  return null;
}

export function createProject(
  actorId: string,
  input: BaseProjectInput,
): ActionResult<{ id: string }> {
  const slug = input.slug || slugify(input.title);
  return transaction(() => {
    const duplicate = findDuplicate(input, slug, "");
    if (duplicate) return { ok: false as const, ...duplicate };
    const id = randomUUID();
    run(
      `insert into base_projects
         (id, slug, title, title_key, description, problem, features, demo_url, status, sort_order,
          kind, category, client, results, published_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
         case when ? = 'published' then strftime('%Y-%m-%dT%H:%M:%fZ','now') end)`,
      id,
      slug,
      input.title,
      slugify(input.title),
      input.description,
      input.problem,
      input.features,
      input.demo_url || null,
      input.status,
      input.sort_order,
      input.kind,
      input.category,
      input.client,
      input.results,
      input.status,
    );
    audit(actorId, "base_project.create", id, null, findProject(id));
    return { ok: true, id };
  });
}

export function updateProject(actorId: string, id: string, input: BaseProjectInput): ActionResult {
  const slug = input.slug || slugify(input.title);
  return transaction(() => {
    const before = findProject(id);
    const duplicate = findDuplicate(input, slug, id);
    if (duplicate) return { ok: false as const, ...duplicate };
    run(
      `update base_projects set slug = ?, title = ?, title_key = ?, description = ?, problem = ?, features = ?,
         demo_url = ?, status = ?, sort_order = ?, kind = ?, category = ?, client = ?, results = ?,
         published_at = case when ? = 'published' then coalesce(published_at, strftime('%Y-%m-%dT%H:%M:%fZ','now')) else published_at end,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       where id = ?`,
      slug,
      input.title,
      slugify(input.title),
      input.description,
      input.problem,
      input.features,
      input.demo_url || null,
      input.status,
      input.sort_order,
      input.kind,
      input.category,
      input.client,
      input.results,
      input.status,
      id,
    );
    audit(actorId, "base_project.update", id, before, findProject(id));
    return { ok: true };
  });
}

export function deleteProject(actorId: string, id: string) {
  let files: string[] = [];
  transaction(() => {
    const before = findProject(id);
    files = listMediaFiles("where project_id = ?", id);
    run("delete from base_projects where id = ?", id);
    audit(actorId, "base_project.delete", id, before, null);
  });
  removeFiles(files);
}

export function addContactMessage(input: ContactInput) {
  run(
    "insert into contact_messages (id, topic, name, email, phone, message, consent) values (?, ?, ?, ?, ?, ?, 1)",
    randomUUID(),
    input.topic,
    input.name,
    input.email,
    input.phone ?? null,
    input.message,
  );
}

export function listMessages() {
  return all<MessageRow>(
    "select id, topic, name, email, phone, message, read, created_at from contact_messages order by created_at desc",
  ).map(({ read, ...row }): AdminMessage => ({ ...row, read: read === 1 }));
}

export function setMessageRead(id: string, read: boolean) {
  run("update contact_messages set read = ? where id = ?", read ? 1 : 0, id);
}

export function addAnalyticsEvent(input: AnalyticsInput) {
  run(
    "insert into analytics_events (event_type, path, label, device) values (?, ?, ?, ?)",
    input.event_type,
    input.path,
    input.label ?? null,
    input.device,
  );
}

export function visitStats(now = Date.now()): VisitStats {
  const since = new Date(now - 30 * 864e5).toISOString();
  const totals = get<{ views: number | null; clicks: number | null; mobile: number | null }>(
    `select
       sum(event_type = 'pageview') as views,
       sum(event_type = 'click') as clicks,
       sum(event_type = 'pageview' and device = 'mobile') as mobile
     from analytics_events where created_at >= ?`,
    since,
  );
  const topClicks = all<{ label: string; total: number }>(
    `select coalesce(label, '?') as label, count(*) as total from analytics_events
     where event_type = 'click' and created_at >= ?
     group by label order by total desc, label limit 5`,
    since,
  );
  return {
    views: totals?.views ?? 0,
    clicks: totals?.clicks ?? 0,
    mobile: totals?.mobile ?? 0,
    topClicks: topClicks.map(({ label, total }): [string, number] => [label, total]),
  };
}

// Depoimentos: o banco recusa publicar sem a autorização de quem falou.
type TestimonialRow = Omit<Testimonial, "authorized"> & { authorized: number };

export function listTestimonials(): Testimonial[] {
  return all<TestimonialRow>(
    `select id, author, role, quote, project_id, authorized, status, sort_order from testimonials
     order by status = 'archived', sort_order, created_at`,
  ).map(({ authorized, ...row }) => ({ ...row, authorized: authorized === 1 }));
}

// Só entra depoimento publicado; o projeto citado aparece só se também estiver publicado.
export function listPublishedTestimonials(projectId?: string): PublicTestimonial[] {
  return all<PublicTestimonial>(
    `select t.id, t.author, t.role, t.quote,
       case when p.status = 'published' then p.slug end as project_slug,
       case when p.status = 'published' then p.title end as project_title
     from testimonials t left join base_projects p on p.id = t.project_id
     where t.status = 'published' and t.authorized = 1 ${projectId ? "and t.project_id = ?" : ""}
     order by t.sort_order, t.created_at`,
    ...(projectId ? [projectId] : []),
  );
}

function findTestimonial(id: string) {
  const row = get<TestimonialRow>("select * from testimonials where id = ?", id);
  if (!row) throw new Error("Depoimento não encontrado");
  return row;
}

function checkTestimonial(input: TestimonialInput): ActionResult | null {
  if (input.status === "published" && !input.authorized) {
    return {
      ok: false,
      field: "authorized",
      message: "Para publicar, confirme que a pessoa autorizou o uso do depoimento.",
    };
  }
  if (input.project_id && !get("select 1 from base_projects where id = ?", input.project_id)) {
    return { ok: false, field: "project_id", message: "Projeto não encontrado." };
  }
  return null;
}

export function saveTestimonial(
  actorId: string,
  id: string | null,
  input: TestimonialInput,
): ActionResult<{ id: string }> {
  const problem = checkTestimonial(input);
  if (problem && !problem.ok) return problem;
  return transaction(() => {
    const values = [
      input.author,
      input.role,
      input.quote,
      input.project_id || null,
      input.authorized ? 1 : 0,
      input.status,
      input.sort_order,
    ];
    if (id) {
      const before = findTestimonial(id);
      run(
        `update testimonials set author = ?, role = ?, quote = ?, project_id = ?, authorized = ?, status = ?,
           sort_order = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') where id = ?`,
        ...values,
        id,
      );
      audit(actorId, "testimonial.update", id, before, findTestimonial(id));
      return { ok: true as const, id };
    }
    const newId = randomUUID();
    run(
      `insert into testimonials (id, author, role, quote, project_id, authorized, status, sort_order)
       values (?, ?, ?, ?, ?, ?, ?, ?)`,
      newId,
      ...values,
    );
    audit(actorId, "testimonial.create", newId, null, findTestimonial(newId));
    return { ok: true as const, id: newId };
  });
}

export function deleteTestimonial(actorId: string, id: string) {
  transaction(() => {
    const before = findTestimonial(id);
    run("delete from testimonials where id = ?", id);
    audit(actorId, "testimonial.delete", id, before, null);
  });
}

import { randomUUID } from "node:crypto";
import type {
  AdminMessage,
  AnalyticsInput,
  BaseProject,
  BaseProjectInput,
  ContactInput,
  PublicBaseProject,
  VisitStats,
} from "../lib/schemas.ts";
import { all, get, run, transaction } from "./db.ts";

type ProjectRow = Omit<BaseProject, "is_published"> & { is_published: number };
type MessageRow = Omit<AdminMessage, "read"> & { read: number };

const toProject = ({ is_published, ...row }: ProjectRow): BaseProject => ({
  ...row,
  is_published: is_published === 1,
});

function audit(actorId: string, action: string, targetId: string, before: unknown, after: unknown) {
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
    `select id, title, description, demo_url from base_projects
     where is_published = 1 order by sort_order, created_at`,
  );
}

export function listProjects() {
  return all<ProjectRow>("select * from base_projects order by sort_order, created_at").map(
    toProject,
  );
}

function findProject(id: string) {
  const row = get<ProjectRow>("select * from base_projects where id = ?", id);
  if (!row) throw new Error("Projeto não encontrado");
  return toProject(row);
}

export function createProject(actorId: string, input: BaseProjectInput) {
  const id = randomUUID();
  transaction(() => {
    run(
      `insert into base_projects (id, title, description, demo_url, is_published, sort_order)
       values (?, ?, ?, ?, ?, ?)`,
      id,
      input.title,
      input.description,
      input.demo_url,
      input.is_published ? 1 : 0,
      input.sort_order,
    );
    audit(actorId, "base_project.create", id, null, findProject(id));
  });
}

export function updateProject(actorId: string, id: string, input: BaseProjectInput) {
  transaction(() => {
    const before = findProject(id);
    run(
      `update base_projects set title = ?, description = ?, demo_url = ?, is_published = ?, sort_order = ?,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       where id = ?`,
      input.title,
      input.description,
      input.demo_url,
      input.is_published ? 1 : 0,
      input.sort_order,
      id,
    );
    audit(actorId, "base_project.update", id, before, findProject(id));
  });
}

export function deleteProject(actorId: string, id: string) {
  transaction(() => {
    const before = findProject(id);
    run("delete from base_projects where id = ?", id);
    audit(actorId, "base_project.delete", id, before, null);
  });
}

export function addContactMessage(input: ContactInput) {
  run(
    "insert into contact_messages (id, name, email, phone, message, consent) values (?, ?, ?, ?, ?, 1)",
    randomUUID(),
    input.name,
    input.email,
    input.phone ?? null,
    input.message,
  );
}

export function listMessages() {
  return all<MessageRow>(
    "select id, name, email, phone, message, read, created_at from contact_messages order by created_at desc",
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

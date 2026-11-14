// Sistemas rodando ao vivo: onde cada projeto está hospedado e se está respondendo.
// A situação pública ("No ar", "Fora do ar") sai sempre da última verificação, nunca de um campo digitado.
import { randomUUID } from "node:crypto";
import type {
  ActionResult,
  Deployment,
  DeploymentInput,
  LiveState,
  PublicDeployment,
} from "../lib/schemas.ts";
import { all, get, run, transaction } from "./db.ts";
import { audit } from "./store.ts";

const CHECK_TIMEOUT_MS = 10_000;
// Guarda as verificações de 90 dias: o bastante para a disponibilidade de 30 dias e para investigar falhas.
const KEEP_CHECKS_DAYS = 90;

type Row = Omit<Deployment, "is_public" | "last_ok" | "state"> & {
  is_public: number;
  last_ok: number | null;
};

export function liveState(mode: Deployment["mode"], lastOk: boolean | null): LiveState {
  if (mode === "planned") return "planned";
  if (mode === "maintenance") return "maintenance";
  if (lastOk === null) return "unchecked";
  return lastOk ? "online" : "offline";
}

function toDeployment(row: Row): Deployment {
  const lastOk = row.last_ok === null ? null : row.last_ok === 1;
  return {
    ...row,
    is_public: row.is_public === 1,
    last_ok: lastOk,
    state: liveState(row.mode, lastOk),
  };
}

const SELECT = `select d.id, d.project_id, p.title as project_title, d.environment, d.url, d.health_url, d.host,
  d.mode, d.is_public, d.notes, d.last_checked_at, d.last_ok, d.last_http_status, d.last_latency_ms
  from deployments d join base_projects p on p.id = d.project_id`;

export function listDeployments(): Deployment[] {
  return all<Row>(`${SELECT} order by p.sort_order, p.title, d.environment`).map(toDeployment);
}

function findDeployment(id: string) {
  const row = get<Row>(`${SELECT} where d.id = ?`, id);
  if (!row) throw new Error("Sistema não encontrado");
  return toDeployment(row);
}

// Público: só sistemas marcados como públicos, de projetos publicados.
export function listPublicDeployments(now = Date.now()): PublicDeployment[] {
  const since = new Date(now - 30 * 864e5).toISOString();
  return all<
    Omit<PublicDeployment, "state"> & {
      mode: Deployment["mode"];
      last_ok: number | null;
      checks: number;
      oks: number;
    }
  >(
    `select d.id, p.slug as project_slug, p.title as project_title, d.environment, d.url, d.mode,
       d.last_ok, d.last_checked_at,
       (select count(*) from deployment_checks c where c.deployment_id = d.id and c.checked_at >= ?) as checks,
       (select count(*) from deployment_checks c where c.deployment_id = d.id and c.checked_at >= ? and c.ok = 1) as oks
     from deployments d join base_projects p on p.id = d.project_id
     where d.is_public = 1 and p.status = 'published'
     order by p.sort_order, p.title, d.environment`,
    since,
    since,
  ).map(({ mode, last_ok, checks, oks, ...row }) => ({
    ...row,
    state: liveState(mode, last_ok === null ? null : last_ok === 1),
    uptime_30d: mode === "active" && checks > 0 ? Math.round((oks / checks) * 1000) / 10 : null,
  }));
}

export function saveDeployment(
  actorId: string,
  id: string | null,
  input: DeploymentInput,
): ActionResult<{ id: string }> {
  return transaction(() => {
    if (!get("select 1 from base_projects where id = ?", input.project_id)) {
      return { ok: false as const, field: "project_id", message: "Projeto não encontrado." };
    }
    const same = get<{ id: string }>(
      "select id from deployments where project_id = ? and environment = ? and id <> ?",
      input.project_id,
      input.environment,
      id ?? "",
    );
    if (same) {
      return {
        ok: false as const,
        field: "environment",
        message: "Este projeto já tem um endereço neste ambiente. Edite o que já existe.",
      };
    }
    const values = [
      input.project_id,
      input.environment,
      input.url,
      input.health_url || null,
      input.host,
      input.mode,
      input.is_public ? 1 : 0,
      input.notes,
    ];
    if (id) {
      const before = findDeployment(id);
      // Endereço novo: a verificação antiga não vale mais para ele.
      const reset = before.url !== input.url || (before.health_url ?? "") !== input.health_url;
      run(
        `update deployments set project_id = ?, environment = ?, url = ?, health_url = ?, host = ?, mode = ?,
           is_public = ?, notes = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
           ${reset ? ", last_checked_at = null, last_ok = null, last_http_status = null, last_latency_ms = null" : ""}
         where id = ?`,
        ...values,
        id,
      );
      if (reset) run("delete from deployment_checks where deployment_id = ?", id);
      audit(actorId, "deployment.update", id, before, findDeployment(id));
      return { ok: true as const, id };
    }
    const newId = randomUUID();
    run(
      `insert into deployments (id, project_id, environment, url, health_url, host, mode, is_public, notes)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      newId,
      ...values,
    );
    audit(actorId, "deployment.create", newId, null, findDeployment(newId));
    return { ok: true as const, id: newId };
  });
}

export function deleteDeployment(actorId: string, id: string) {
  transaction(() => {
    const before = findDeployment(id);
    run("delete from deployments where id = ?", id);
    audit(actorId, "deployment.delete", id, before, null);
  });
}

export type CheckResult = {
  ok: boolean;
  http_status: number | null;
  latency_ms: number;
  error: string | null;
};

// Considera "no ar" qualquer resposta 2xx ou 3xx dentro do tempo limite.
export async function probe(url: string, fetcher: typeof fetch = fetch): Promise<CheckResult> {
  const started = Date.now();
  try {
    const response = await fetcher(url, {
      method: "GET",
      redirect: "manual",
      headers: { "user-agent": "AruaStatus/1.0" },
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });
    await response.body?.cancel();
    const ok = response.status >= 200 && response.status < 400;
    return {
      ok,
      http_status: response.status,
      latency_ms: Date.now() - started,
      error: ok ? null : `Resposta ${response.status}`,
    };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return {
      ok: false,
      http_status: null,
      latency_ms: Date.now() - started,
      error: timedOut ? "Sem resposta em 10 segundos" : "Não foi possível conectar",
    };
  }
}

export function recordCheck(id: string, result: CheckResult, now = new Date()) {
  const at = now.toISOString();
  transaction(() => {
    run(
      "insert into deployment_checks (deployment_id, ok, http_status, latency_ms, error, checked_at) values (?, ?, ?, ?, ?, ?)",
      id,
      result.ok ? 1 : 0,
      result.http_status,
      result.latency_ms,
      result.error,
      at,
    );
    run(
      `update deployments set last_checked_at = ?, last_ok = ?, last_http_status = ?, last_latency_ms = ? where id = ?`,
      at,
      result.ok ? 1 : 0,
      result.http_status,
      result.latency_ms,
      id,
    );
    run(
      "delete from deployment_checks where deployment_id = ? and checked_at < ?",
      id,
      new Date(now.getTime() - KEEP_CHECKS_DAYS * 864e5).toISOString(),
    );
  });
}

// Verifica um sistema ou todos os ativos. Sistemas planejados ou em manutenção não são verificados.
export async function checkDeployments(onlyId?: string, fetcher: typeof fetch = fetch) {
  const targets = listDeployments().filter(
    (d) => d.mode === "active" && (onlyId === undefined || d.id === onlyId),
  );
  const results = await Promise.all(
    targets.map(async (d) => {
      const result = await probe(d.health_url ?? d.url, fetcher);
      recordCheck(d.id, result);
      return { id: d.id, title: d.project_title, environment: d.environment, ...result };
    }),
  );
  return results;
}

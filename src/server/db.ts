// Banco local em um único arquivo (data/arua.db), sem serviço externo.
// Todo acesso passa pelo servidor: o navegador nunca fala direto com o banco.
import { chmodSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { migration2 } from "./migration-2.ts";
import { migration3 } from "./migration-3.ts";
import { migration4 } from "./migration-4.ts";

const NOW = `(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;

// Para mudar a estrutura, acrescente um item ao final; nunca edite um item já usado.
export const MIGRATIONS: (string | ((database: DatabaseSync) => void))[] = [
  `
  create table users (
    id text primary key,
    email text not null unique collate nocase check (length(email) between 3 and 255),
    password_hash text not null,
    role text not null default 'admin' check (role in ('admin')),
    created_at text not null default ${NOW},
    updated_at text not null default ${NOW}
  );
  create table sessions (
    token_hash text primary key,
    user_id text not null references users(id) on delete cascade,
    expires_at integer not null
  );
  create index sessions_user_id on sessions(user_id);
  create table login_attempts (
    email text primary key collate nocase,
    failures integer not null,
    locked_until integer not null,
    updated_at integer not null
  );
  create table contact_messages (
    id text primary key,
    name text not null check (length(name) between 1 and 100),
    email text not null check (length(email) between 3 and 255),
    phone text check (phone is null or length(phone) <= 30),
    message text not null check (length(message) between 1 and 2000),
    consent integer not null check (consent = 1),
    read integer not null default 0 check (read in (0, 1)),
    created_at text not null default ${NOW}
  );
  create table analytics_events (
    id integer primary key,
    event_type text not null check (event_type in ('pageview', 'click')),
    path text not null check (length(path) <= 200),
    label text check (label is null or length(label) <= 100),
    device text not null check (device in ('mobile', 'desktop')),
    created_at text not null default ${NOW}
  );
  create index analytics_events_created_at on analytics_events(created_at);
  create table base_projects (
    id text primary key,
    title text not null check (length(title) between 1 and 80),
    description text not null check (length(description) between 1 and 300),
    demo_url text not null check (
      length(demo_url) <= 500
      and demo_url like 'https://_%'
      and demo_url not glob '*[' || char(9, 10, 13, 32) || ']*'
    ),
    is_published integer not null default 0 check (is_published in (0, 1)),
    sort_order integer not null default 0 check (sort_order between 0 and 9999),
    created_at text not null default ${NOW},
    updated_at text not null default ${NOW}
  );
  create table admin_audit_log (
    id integer primary key,
    actor_id text,
    action text not null,
    target_id text,
    before_data text,
    after_data text,
    created_at text not null default ${NOW}
  );
  `,
  migration2,
  migration3,
  migration4,
];

let db: DatabaseSync | undefined;

export function getDb(): DatabaseSync {
  if (db) return db;
  const path = process.env["ARUA_DB_PATH"] ?? resolve(process.cwd(), "data/arua.db");
  const isFile = path !== ":memory:";
  if (isFile) mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const opened = new DatabaseSync(path);
  // O arquivo guarda dados pessoais: só o seu usuário do computador pode lê-lo.
  if (isFile) chmodSync(path, 0o600);
  opened.exec("pragma foreign_keys = on; pragma journal_mode = wal; pragma busy_timeout = 5000;");
  db = opened;
  migrate(opened);
  return opened;
}

function migrate(database: DatabaseSync) {
  const row = database.prepare("pragma user_version").get() as { user_version: number };
  MIGRATIONS.slice(row.user_version).forEach((sql, index) => {
    transaction(() => {
      if (typeof sql === "string") database.exec(sql);
      else sql(database);
      database.exec(`pragma user_version = ${row.user_version + index + 1}`);
    });
  });
}

export function transaction<T>(work: () => T): T {
  const database = db ?? getDb();
  database.exec("begin immediate");
  try {
    const result = work();
    database.exec("commit");
    return result;
  } catch (error) {
    database.exec("rollback");
    throw error;
  }
}

// O SQLite devolve objetos sem protótipo, que não atravessam a rede; aqui viram objetos comuns.
export function all<T>(sql: string, ...params: SQLInputValue[]): T[] {
  return getDb()
    .prepare(sql)
    .all(...params)
    .map((row) => ({ ...row }) as T);
}

export function get<T>(sql: string, ...params: SQLInputValue[]): T | undefined {
  return all<T>(sql, ...params)[0];
}

export function run(sql: string, ...params: SQLInputValue[]) {
  return getDb()
    .prepare(sql)
    .run(...params);
}

// Usado nos testes, para cada um começar com um banco vazio.
export function uploadsDir() {
  if (process.env["ARUA_UPLOADS_DIR"]) return process.env["ARUA_UPLOADS_DIR"];
  const path = process.env["ARUA_DB_PATH"];
  return resolve(
    path && path !== ":memory:" ? dirname(path) : resolve(process.cwd(), "data"),
    "uploads",
  );
}

export function closeDb() {
  db?.close();
  db = undefined;
}

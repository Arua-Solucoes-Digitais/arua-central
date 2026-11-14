import { createHash, randomBytes } from "node:crypto";
import { get, run } from "./db.ts";
import { PASSWORD_MAX, hashPassword, verifyPassword } from "./password.ts";

export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;
const ATTEMPT_RETENTION_MS = 24 * 60 * 60 * 1000;

export type AdminUser = { id: string; email: string };
export type LoginResult =
  { status: "ok"; token: string; user: AdminUser } | { status: "invalid" } | { status: "locked" };

// Comparar com este valor quando o e-mail não existe mantém o mesmo tempo de resposta,
// para a demora não revelar quais e-mails têm conta.
const placeholderHash = hashPassword(randomBytes(32).toString("hex"));

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

// A tentativa é contada antes de conferir a senha, para pedidos simultâneos não escaparem do limite.
function registerAttempt(email: string, now: number): "allowed" | "locked" {
  run(
    "delete from login_attempts where updated_at < ? and locked_until < ?",
    now - ATTEMPT_RETENTION_MS,
    now,
  );
  const attempt = get<{ failures: number; locked_until: number }>(
    "select failures, locked_until from login_attempts where email = ?",
    email,
  );
  if (attempt && attempt.locked_until > now) return "locked";
  const failures = (attempt && attempt.locked_until === 0 ? attempt.failures : 0) + 1;
  run(
    `insert into login_attempts (email, failures, locked_until, updated_at) values (?, ?, ?, ?)
     on conflict (email) do update set
       failures = excluded.failures, locked_until = excluded.locked_until, updated_at = excluded.updated_at`,
    email,
    failures,
    failures >= MAX_FAILURES ? now + LOCK_MS : 0,
    now,
  );
  return "allowed";
}

export async function login(
  emailInput: string,
  password: string,
  now = Date.now(),
): Promise<LoginResult> {
  const email = emailInput.trim().toLowerCase();
  if (!email || email.length > 255 || password.length > PASSWORD_MAX) return { status: "invalid" };
  if (registerAttempt(email, now) === "locked") return { status: "locked" };

  const user = get<AdminUser & { password_hash: string }>(
    "select id, email, password_hash from users where email = ?",
    email,
  );
  const matches = await verifyPassword(password, user?.password_hash ?? (await placeholderHash));
  if (!user || !matches) return { status: "invalid" };

  run("delete from login_attempts where email = ?", email);
  run("delete from sessions where expires_at <= ?", now);
  const token = randomBytes(32).toString("base64url");
  // No banco fica só o hash: uma cópia do arquivo não permite assumir uma sessão aberta.
  run(
    "insert into sessions (token_hash, user_id, expires_at) values (?, ?, ?)",
    hashToken(token),
    user.id,
    now + SESSION_MAX_AGE_SECONDS * 1000,
  );
  return { status: "ok", token, user: { id: user.id, email: user.email } };
}

export function userFromToken(token: string | undefined, now = Date.now()): AdminUser | null {
  if (!token) return null;
  const user = get<AdminUser>(
    `select users.id, users.email from sessions
     join users on users.id = sessions.user_id
     where sessions.token_hash = ? and sessions.expires_at > ? and users.role = 'admin'`,
    hashToken(token),
    now,
  );
  return user ?? null;
}

export function logout(token: string | undefined) {
  if (token) run("delete from sessions where token_hash = ?", hashToken(token));
}

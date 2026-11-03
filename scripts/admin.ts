// Cria o acesso de administrador ou troca a senha: npm run admin
// Roda só no terminal, para ninguém conseguir criar um acesso pela página.
import { randomUUID } from "node:crypto";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { closeDb, get, run, transaction } from "../src/server/db.ts";
import { PASSWORD_MAX, PASSWORD_MIN, hashPassword } from "../src/server/password.ts";

let hidden = false;
const output = new Writable({
  write(chunk, _encoding, done) {
    if (!hidden) stdout.write(chunk);
    done();
  },
});
const reader = createInterface({ input: stdin, output, terminal: stdin.isTTY });
const lines = reader[Symbol.asyncIterator]();

async function ask(question: string, secret = false) {
  stdout.write(question);
  hidden = secret;
  const { value, done } = await lines.next();
  hidden = false;
  if (secret && stdin.isTTY) stdout.write("\n");
  if (done) throw new Error("Entrada encerrada antes do fim.");
  return String(value);
}

async function main() {
  const email = (await ask("E-mail do administrador: ")).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+$/.test(email) || email.length > 255) throw new Error("E-mail inválido.");

  const password = await ask(
    `Senha (mínimo de ${PASSWORD_MIN} caracteres; não aparece ao digitar): `,
    true,
  );
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    throw new Error(`A senha precisa ter de ${PASSWORD_MIN} a ${PASSWORD_MAX} caracteres.`);
  }
  if ((await ask("Repita a senha: ", true)) !== password)
    throw new Error("As senhas não são iguais.");

  const passwordHash = await hashPassword(password);
  const existing = get<{ id: string }>("select id from users where email = ?", email);
  transaction(() => {
    if (existing) {
      run(
        "update users set password_hash = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') where id = ?",
        passwordHash,
        existing.id,
      );
      // Ao trocar a senha, quem estava conectado precisa entrar de novo.
      run("delete from sessions where user_id = ?", existing.id);
    } else {
      run(
        "insert into users (id, email, password_hash) values (?, ?, ?)",
        randomUUID(),
        email,
        passwordHash,
      );
    }
    run("delete from login_attempts where email = ?", email);
  });
  stdout.write(existing ? "Senha alterada.\n" : "Administrador criado.\n");
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => {
    reader.close();
    closeDb();
  });

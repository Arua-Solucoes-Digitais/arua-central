// Importa um estabelecimento de uma pasta para o banco deste servidor:
//   npm run property:import -- src/demo/properties/encanto-da-mata
// Faz uma cópia do banco em data/backups antes e nunca substitui um estabelecimento que já existe.
import { existsSync, mkdirSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { argv, exit } from "node:process";
import { closeDb, getDb } from "../src/server/db.ts";
import { importProperty } from "../src/server/property-import.ts";

const dir = argv[2];
if (!dir) {
  console.error("Uso: npm run property:import -- <pasta com property.json>");
  exit(1);
}

const dbPath = process.env["ARUA_DB_PATH"] ?? resolve(process.cwd(), "data/arua.db");
const hadDb = existsSync(dbPath);
const db = getDb();
try {
  if (hadDb) {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..*/, "Z");
    const backups = resolve(dirname(dbPath), "backups");
    mkdirSync(backups, { recursive: true, mode: 0o700 });
    const backup = resolve(backups, `arua-${stamp}-antes-de-importar-${basename(resolve(dir))}.db`);
    db.prepare("vacuum into ?").run(backup);
    console.log(`cópia do banco: ${backup}`);
  }
  const result = importProperty(dir, "script:import-property");
  console.log(
    `importado: /hospedagens/${result.slug} (${Object.keys(result.mediaFiles).length} arquivo(s))`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  closeDb();
}

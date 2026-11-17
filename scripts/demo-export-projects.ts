// Copia para a demonstração os projetos PUBLICADOS do banco local: npm run demo:export-projects
// Lê data/arua.db só para leitura e exporta apenas campos públicos de projetos com status
// "published" (os mesmos que o site mostra a qualquer visitante). Rascunhos, mensagens,
// pedidos, usuários e fotos nunca saem. O resultado (src/demo/projects.json) é revisado no PR.
import { existsSync, writeFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const source = process.env["ARUA_DB_PATH"] ?? "data/arua.db";
if (!existsSync(source)) {
  console.error(`banco não encontrado: ${source}`);
  process.exit(1);
}

const db = new DatabaseSync(source, { readOnly: true });
const projects = db
  .prepare(
    `select slug, title, description, problem, features, demo_url, kind, category, client, results, sort_order
     from base_projects where status = 'published' order by sort_order, created_at`,
  )
  .all();
db.close();

writeFileSync("src/demo/projects.json", JSON.stringify(projects, null, 2) + "\n");
console.log(`exportados: ${projects.map((p) => p["slug"]).join(", ") || "nenhum"}`);

// Gera src/demo/snapshot.json para a demonstração estática (GitHub Pages): npm run demo:snapshot
// Usa SEMPRE um banco novo e temporário, criado só com as migrações. Nunca lê data/arua.db,
// então nenhum dado de cliente, mensagem ou pedido entra na demonstração.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "arua-demo-"));
process.env["ARUA_DB_PATH"] = join(dir, "demo.db");
process.env["ARUA_UPLOADS_DIR"] = join(dir, "uploads");

const db = await import("../src/server/db.ts");
const store = await import("../src/server/store.ts");
const deployments = await import("../src/server/deployments.ts");
const hospedagens = await import("../src/server/hospedagens.ts");

try {
  // Na demonstração o produto da própria Aruá aparece como publicado (no banco novo ele nasce rascunho).
  db.run("update base_projects set status = 'published' where slug = 'arua-hospedagens'");

  const projects = store.listPublishedProjects();
  const projectPages = Object.fromEntries(
    projects.map((p) => {
      const page = store.getProjectPage(p.slug, false);
      return [
        p.slug,
        page && {
          ...page,
          deployments: deployments
            .listPublicDeployments()
            .filter((d) => d.project_slug === page.slug),
          testimonials: store.listPublishedTestimonials(page.id),
        },
      ];
    }),
  );
  const propertyPages = Object.fromEntries(
    db
      .all<{ slug: string }>("select slug from properties where status = 'published'")
      .map(({ slug }) => [slug, hospedagens.getPropertyPage(slug, false)]),
  );

  const snapshot = {
    showcase: {
      projects,
      deployments: deployments.listPublicDeployments(),
      testimonials: store.listPublishedTestimonials(),
    },
    projectPages,
    propertyPages,
  };
  writeFileSync("src/demo/snapshot.json", JSON.stringify(snapshot, null, 2) + "\n");
  console.log(
    `snapshot: ${projects.length} projeto(s), ${Object.keys(propertyPages).length} vitrine(s)`,
  );
} finally {
  db.closeDb();
  rmSync(dir, { recursive: true, force: true });
}

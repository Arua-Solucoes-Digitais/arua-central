// Gera src/demo/snapshot.json para a demonstração estática (GitHub Pages): npm run demo:snapshot
// Usa SEMPRE um banco novo e temporário, criado pelas migrações, mais os projetos publicados de
// src/demo/projects.json. Nunca lê data/arua.db, então nenhum dado de cliente, mensagem ou pedido
// entra na demonstração.
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const dir = mkdtempSync(join(tmpdir(), "arua-demo-"));
process.env["ARUA_DB_PATH"] = join(dir, "demo.db");
process.env["ARUA_UPLOADS_DIR"] = join(dir, "uploads");

const db = await import("../src/server/db.ts");
const store = await import("../src/server/store.ts");
const deployments = await import("../src/server/deployments.ts");
const hospedagens = await import("../src/server/hospedagens.ts");
const { importProperty } = await import("../src/server/property-import.ts");
const { slugify } = await import("../src/lib/slug.ts");
// Projetos publicados exportados do painel (npm run demo:export-projects), só campos públicos.
type ExportedProject = {
  slug: string;
  title: string;
  description: string;
  problem: string;
  features: string;
  demo_url: string | null;
  kind: string;
  category: string;
  client: string;
  results: string;
  sort_order: number;
};
const exported = JSON.parse(readFileSync("src/demo/projects.json", "utf8")) as ExportedProject[];

try {
  // Na demonstração o produto da própria Aruá aparece como publicado (no banco novo ele nasce rascunho).
  db.run("update base_projects set status = 'published' where slug = 'arua-hospedagens'");

  // Vitrines de demonstração (public/demos/<slug>/property.json), com autorização registrada em
  // docs/demos/. Cada mídia ganha "src" (arquivo em public/) para a demonstração funcionar sem servidor.
  const DEMOS_DIR = "public/demos";
  const mediaFiles: Record<string, string> = {};
  for (const folder of readdirSync(DEMOS_DIR).sort()) {
    if (!existsSync(join(DEMOS_DIR, folder, "property.json"))) continue;
    const imported = importProperty(join(DEMOS_DIR, folder), "script:demo-snapshot");
    for (const [id, file] of Object.entries(imported.mediaFiles)) mediaFiles[id] = `/demos/${file}`;
  }
  // O exemplo do produto é um estabelecimento real, não o fictício.
  // As vitrines entram com o WhatsApp (o da Aruá nas demonstrações), porque sem servidor é o
  // navegador que monta o link do pedido.
  db.run(
    "update base_projects set demo_url = '/hospedagens/encanto-da-mata' where slug = 'arua-hospedagens'",
  );
  for (const p of exported) {
    if (db.get("select id from base_projects where slug = ?", p.slug)) continue;
    db.run(
      `insert into base_projects
         (id, slug, title, title_key, description, problem, features, demo_url, status, sort_order,
          kind, category, client, results, published_at)
       values (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`,
      randomUUID(),
      p.slug,
      p.title,
      slugify(p.title),
      p.description,
      p.problem,
      p.features,
      p.demo_url ?? null,
      p.sort_order,
      p.kind,
      p.category,
      p.client,
      p.results,
    );
  }

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
      .map(({ slug }) => [slug, withSrc(hospedagens.getPropertyPage(slug, true), mediaFiles)]),
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

type Page = ReturnType<typeof hospedagens.getPropertyPage>;
type Media = NonNullable<Page>["gallery"][number];
function withSrc(page: Page, files: Record<string, string>): Page {
  if (!page) return page;
  const mark = (item: Media): Media => {
    const file = files[item.id];
    return file ? { ...item, src: file } : item;
  };
  return {
    ...page,
    logo: page.logo && mark(page.logo),
    banners: page.banners.map(mark),
    gallery: page.gallery.map(mark),
    stays: page.stays.map((stay) => ({ ...stay, photos: stay.photos.map(mark) })),
  };
}

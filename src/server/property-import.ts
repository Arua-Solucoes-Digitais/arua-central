// Cria um estabelecimento completo (dados, modalidades e fotos) a partir de uma pasta com property.json.
// Usa as mesmas validações e funções do painel. Usado pela demonstração estática (scripts/demo-snapshot.ts)
// e pelo terminal (npm run property:import), nunca por uma página.
import { readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { z } from "zod";
import { propertySchema, staySchema } from "../lib/schemas.ts";
import { get, run } from "./db.ts";
import { createProperty, saveStay } from "./hospedagens.ts";
import { removeFiles, saveMedia } from "./media.ts";

const seedSchema = z.object({
  property: propertySchema,
  stays: z.array(staySchema.extend({ key: z.string().min(1) })),
  media: z.array(
    z.object({
      // Só o nome do arquivo: nada fora da pasta do estabelecimento é lido.
      file: z.string().regex(/^[a-z0-9][a-z0-9._-]*\.(jpg|png|webp|mp4|webm)$/),
      role: z.enum(["logo", "banner", "gallery", "stay"]),
      stay: z.string().optional(),
      alt: z.string().max(200),
      description: z.string().max(300),
    }),
  ),
});

export type ImportedProperty = {
  id: string;
  slug: string;
  // id da mídia no banco -> "<pasta>/<arquivo>", para a demonstração estática achar o arquivo.
  mediaFiles: Record<string, string>;
};

export function importProperty(dir: string, actorId: string): ImportedProperty {
  const folder = resolve(dir);
  const seed = seedSchema.parse(JSON.parse(readFileSync(join(folder, "property.json"), "utf8")));
  const slug = seed.property.slug;
  if (!slug) throw new Error("property.json precisa de um slug.");
  // Importar não substitui nada: se o endereço já existe, quem decide é o administrador, pelo painel.
  if (get("select id from properties where slug = ?", slug)) {
    throw new Error(`Já existe um estabelecimento com o endereço "${slug}".`);
  }

  const created = createProperty(actorId, seed.property);
  if (!created.ok) throw new Error(`${created.field}: ${created.message}`);
  const id = created.id;
  const uploaded: string[] = [];
  try {
    const stayIds = new Map<string, string>();
    for (const { key, ...stay } of seed.stays) {
      const saved = saveStay(actorId, id, null, stay);
      if (!saved.ok) throw new Error(`${stay.name}: ${saved.message}`);
      stayIds.set(key, saved.id);
    }

    const mediaFiles: Record<string, string> = {};
    for (const item of seed.media) {
      const stayId = item.stay === undefined ? undefined : stayIds.get(item.stay);
      if (item.stay !== undefined && !stayId)
        throw new Error(`${item.file}: modalidade inexistente.`);
      const bytes = new Uint8Array(readFileSync(join(folder, item.file)));
      const saved = saveMedia(
        actorId,
        { type: "property", id, stayId },
        item.role,
        bytes,
        item.alt,
        item.description,
      );
      if (!saved.ok) throw new Error(`${item.file}: ${saved.message}`);
      const row = get<{ file: string }>("select file from media where id = ?", saved.id);
      if (row) uploaded.push(row.file);
      mediaFiles[saved.id] = `${basename(folder)}/${item.file}`;
    }
    return { id, slug, mediaFiles };
  } catch (error) {
    // Sem meio-termo: um erro desfaz o estabelecimento inteiro (modalidades e fotos saem em cascata).
    run("delete from properties where id = ?", id);
    removeFiles(uploaded);
    throw error;
  }
}

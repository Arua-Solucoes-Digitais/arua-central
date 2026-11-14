// Fotos e vídeos ficam em data/uploads; o banco guarda só as informações de cada arquivo.
import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { MediaItem, MediaRole } from "../lib/schemas.ts";
import { all, get, run, transaction, uploadsDir } from "./db.ts";

export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 64 * 1024 * 1024;

type Detected = { mime: string; kind: "image" | "video"; ext: string };

// O tipo é decidido pelo conteúdo do arquivo, não pelo nome nem pelo que o navegador informa.
// SVG e HTML ficam de fora de propósito, porque podem carregar código.
export function detectFileType(bytes: Uint8Array): Detected | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return { mime: "image/jpeg", kind: "image", ext: "jpg" };
  if (ascii(0, 8) === "\x89PNG\r\n\x1a\n") return { mime: "image/png", kind: "image", ext: "png" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP")
    return { mime: "image/webp", kind: "image", ext: "webp" };
  if (ascii(4, 8) === "ftyp") return { mime: "video/mp4", kind: "video", ext: "mp4" };
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3)
    return { mime: "video/webm", kind: "video", ext: "webm" };
  return null;
}

export type MediaTarget =
  { type: "project"; id: string } | { type: "property"; id: string; stayId?: string | undefined };

const SINGLE_ROLES: MediaRole[] = ["cover", "logo"];
const ROLES_BY_TARGET: Record<MediaTarget["type"], MediaRole[]> = {
  project: ["cover"],
  property: ["logo", "banner", "gallery", "stay"],
};

export type UploadResult = { ok: true; id: string } | { ok: false; message: string };

export function saveMedia(
  actorId: string,
  target: MediaTarget,
  role: MediaRole,
  bytes: Uint8Array,
  alt: string,
  description: string,
): UploadResult {
  if (!ROLES_BY_TARGET[target.type].includes(role))
    return { ok: false, message: "Destino inválido." };
  const stayId = target.type === "property" ? target.stayId : undefined;
  if ((role === "stay") !== Boolean(stayId)) return { ok: false, message: "Destino inválido." };

  const type = detectFileType(bytes);
  if (!type)
    return { ok: false, message: "Use uma imagem JPG, PNG ou WebP, ou um vídeo MP4 ou WebM." };
  if (type.kind === "video" && role !== "gallery") {
    return { ok: false, message: "Vídeos só podem ser enviados na galeria." };
  }
  const limit = type.kind === "image" ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES;
  if (bytes.length > limit) {
    return { ok: false, message: `O arquivo passa do limite de ${limit / 1024 / 1024} MB.` };
  }

  const owner =
    target.type === "project"
      ? get("select id from base_projects where id = ?", target.id)
      : stayId
        ? get("select id from stay_types where id = ? and property_id = ?", stayId, target.id)
        : get("select id from properties where id = ?", target.id);
  if (!owner) return { ok: false, message: "Item não encontrado." };

  const id = randomUUID();
  const file = `${id}.${type.ext}`;
  const dir = uploadsDir();
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  writeFileSync(join(dir, file), bytes, { mode: 0o600 });

  const projectId = target.type === "project" ? target.id : null;
  const propertyId = target.type === "property" ? target.id : null;
  let replaced: string[] = [];
  try {
    transaction(() => {
      if (SINGLE_ROLES.includes(role)) {
        replaced = deleteRows(
          "where role = ? and (project_id is ? and property_id is ?)",
          role,
          projectId,
          propertyId,
        );
      }
      const next = get<{ n: number }>(
        `select coalesce(max(sort_order), -1) + 1 as n from media
         where role = ? and project_id is ? and property_id is ? and stay_id is ?`,
        role,
        projectId,
        propertyId,
        stayId ?? null,
      );
      run(
        `insert into media (id, project_id, property_id, stay_id, role, kind, mime, size, file, alt, description, sort_order)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        projectId,
        propertyId,
        stayId ?? null,
        role,
        type.kind,
        type.mime,
        bytes.length,
        file,
        alt.slice(0, 200),
        description.slice(0, 300),
        next?.n ?? 0,
      );
      run(
        "insert into admin_audit_log (actor_id, action, target_id, after_data) values (?, 'media.create', ?, ?)",
        actorId,
        id,
        JSON.stringify({
          role,
          kind: type.kind,
          project_id: projectId,
          property_id: propertyId,
          stay_id: stayId ?? null,
        }),
      );
    });
  } catch (error) {
    removeFiles([file]);
    throw error;
  }
  removeFiles(replaced);
  return { ok: true, id };
}

function deleteRows(where: string, ...params: (string | null)[]) {
  const files = all<{ file: string }>(`select file from media ${where}`, ...params).map(
    (m) => m.file,
  );
  run(`delete from media ${where}`, ...params);
  return files;
}

// O nome vem sempre do banco, mas a conferência impede sair da pasta em qualquer hipótese.
export function mediaPath(file: string) {
  const dir = resolve(uploadsDir());
  const path = resolve(dir, file);
  if (!path.startsWith(`${dir}/`)) throw new Error("Caminho inválido");
  return path;
}

export function removeFiles(files: string[]) {
  for (const file of files) rmSync(mediaPath(file), { force: true });
}

export function listMediaFiles(where: string, ...params: string[]) {
  return all<{ file: string }>(`select file from media ${where}`, ...params).map((m) => m.file);
}

export function listMedia(where: string, ...params: string[]): MediaItem[] {
  return all<MediaItem>(
    `select id, role, kind, alt, description, stay_id from media ${where} order by sort_order, created_at`,
    ...params,
  );
}

export function updateMedia(actorId: string, id: string, alt: string, description: string) {
  transaction(() => {
    if (!get("select id from media where id = ?", id)) throw new Error("Arquivo não encontrado");
    run("update media set alt = ?, description = ? where id = ?", alt, description, id);
    run(
      "insert into admin_audit_log (actor_id, action, target_id) values (?, 'media.update', ?)",
      actorId,
      id,
    );
  });
}

export function moveMedia(actorId: string, id: string, direction: "up" | "down") {
  transaction(() => {
    const item = get<{
      role: string;
      project_id: string | null;
      property_id: string | null;
      stay_id: string | null;
    }>("select role, project_id, property_id, stay_id from media where id = ?", id);
    if (!item) throw new Error("Arquivo não encontrado");
    const siblings = all<{ id: string }>(
      `select id from media where role = ? and project_id is ? and property_id is ? and stay_id is ?
       order by sort_order, created_at`,
      item.role,
      item.project_id,
      item.property_id,
      item.stay_id,
    ).map((m) => m.id);
    const from = siblings.indexOf(id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (to < 0 || to >= siblings.length) return;
    const moved = siblings.splice(from, 1);
    siblings.splice(to, 0, ...moved);
    siblings.forEach((siblingId, index) =>
      run("update media set sort_order = ? where id = ?", index, siblingId),
    );
    run(
      "insert into admin_audit_log (actor_id, action, target_id) values (?, 'media.move', ?)",
      actorId,
      id,
    );
  });
}

export function deleteMedia(actorId: string, id: string) {
  let files: string[] = [];
  transaction(() => {
    files = deleteRows("where id = ?", id);
    if (files.length === 0) throw new Error("Arquivo não encontrado");
    run(
      "insert into admin_audit_log (actor_id, action, target_id) values (?, 'media.delete', ?)",
      actorId,
      id,
    );
  });
  removeFiles(files);
}

export type ServedMedia = { path: string; mime: string; size: number; isPublic: boolean };

// Só sai publicado o que pertence a um projeto ou estabelecimento publicado.
export function findMedia(id: string): ServedMedia | null {
  const row = get<{ file: string; mime: string; size: number; status: string | null }>(
    `select media.file, media.mime, media.size, coalesce(base_projects.status, properties.status) as status
     from media
     left join base_projects on base_projects.id = media.project_id
     left join properties on properties.id = media.property_id
     where media.id = ?`,
    id,
  );
  if (!row) return null;
  return {
    path: mediaPath(row.file),
    mime: row.mime,
    size: row.size,
    isPublic: row.status === "published",
  };
}

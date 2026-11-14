import { createFileRoute } from "@tanstack/react-router";
import { getCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { userFromToken } from "@/server/auth";
import { VIDEO_MAX_BYTES, saveMedia, type MediaTarget } from "@/server/media";
import { SESSION_COOKIE } from "@/server/request";

const fieldsSchema = z.object({
  target: z.enum(["project", "property"]),
  target_id: z.string().uuid(),
  stay_id: z.string().uuid().optional(),
  role: z.enum(["cover", "logo", "banner", "gallery", "stay"]),
  alt: z.string().max(200),
  description: z.string().max(300),
});

const reply = (status: number, body: object) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const refuse = (status: number, message: string) => reply(status, { ok: false, message });

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // A proteção automática contra outros sites vale só para as funções do servidor; aqui é manual.
        const site = request.headers.get("sec-fetch-site");
        const origin = request.headers.get("origin");
        const host = request.headers.get("host");
        const sameOrigin = site
          ? site === "same-origin"
          : origin !== null && new URL(origin).host === host;
        if (!sameOrigin) return refuse(403, "Pedido recusado.");

        // A sessão vem antes de ler o corpo, para ninguém sem acesso conseguir enviar arquivos grandes.
        const user = userFromToken(getCookie(SESSION_COOKIE));
        if (!user) return refuse(403, "Sua sessão terminou. Entre novamente.");

        const declared = Number(request.headers.get("content-length") ?? "0");
        if (!declared || declared > VIDEO_MAX_BYTES + 1024 * 1024) {
          return refuse(413, "O arquivo passa do limite de 64 MB.");
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return refuse(400, "Não foi possível ler o arquivo.");
        }
        const file = form.get("file");
        const fields = fieldsSchema.safeParse({
          target: form.get("target"),
          target_id: form.get("target_id"),
          stay_id: form.get("stay_id") ?? undefined,
          role: form.get("role"),
          alt: form.get("alt") ?? "",
          description: form.get("description") ?? "",
        });
        if (!(file instanceof File) || !fields.success) return refuse(400, "Envio inválido.");

        const target: MediaTarget =
          fields.data.target === "project"
            ? { type: "project", id: fields.data.target_id }
            : { type: "property", id: fields.data.target_id, stayId: fields.data.stay_id };
        const result = saveMedia(
          user.id,
          target,
          fields.data.role,
          new Uint8Array(await file.arrayBuffer()),
          fields.data.alt,
          fields.data.description,
        );
        return reply(result.ok ? 200 : 400, result);
      },
    },
  },
});

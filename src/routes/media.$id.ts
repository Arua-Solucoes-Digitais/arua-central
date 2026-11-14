import { createFileRoute } from "@tanstack/react-router";
import { createReadStream, statSync } from "node:fs";
import { Readable } from "node:stream";
import { getCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { userFromToken } from "@/server/auth";
import { findMedia } from "@/server/media";
import { SESSION_COOKIE } from "@/server/request";

const notFound = () => new Response("Não encontrado", { status: 404 });

export const Route = createFileRoute("/media/$id")({
  server: {
    handlers: {
      GET: ({ params, request }) => {
        if (!z.string().uuid().safeParse(params.id).success) return notFound();
        const item = findMedia(params.id);
        if (!item) return notFound();
        if (!item.isPublic && !userFromToken(getCookie(SESSION_COOKIE))) return notFound();
        let size: number;
        try {
          size = statSync(item.path).size;
        } catch {
          return notFound();
        }

        const headers: Record<string, string> = {
          "Content-Type": item.mime,
          "X-Content-Type-Options": "nosniff",
          "Accept-Ranges": "bytes",
          // Não é "immutable": ao tirar um item do ar, o arquivo também precisa deixar de ser entregue.
          "Cache-Control": item.isPublic ? "public, max-age=300" : "private, no-store",
        };
        // Navegadores pedem vídeo por partes; o Safari do iPhone não toca sem isso.
        const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
        if (range && (range[1] || range[2])) {
          const start = range[1] ? Number(range[1]) : Math.max(size - Number(range[2]), 0);
          const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
          if (start > end || start >= size) {
            return new Response(null, {
              status: 416,
              headers: { "Content-Range": `bytes */${size}` },
            });
          }
          return new Response(
            Readable.toWeb(createReadStream(item.path, { start, end })) as ReadableStream,
            {
              status: 206,
              headers: {
                ...headers,
                "Content-Range": `bytes ${start}-${end}/${size}`,
                "Content-Length": String(end - start + 1),
              },
            },
          );
        }
        return new Response(Readable.toWeb(createReadStream(item.path)) as ReadableStream, {
          headers: { ...headers, "Content-Length": String(size) },
        });
      },
    },
  },
});

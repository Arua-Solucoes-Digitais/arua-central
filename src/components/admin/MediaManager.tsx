import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteMediaItem, moveMediaItem, updateMediaItem } from "@/lib/api";
import type { MediaItem, MediaRole } from "@/lib/schemas";

export function MediaManager({
  title,
  hint,
  target,
  targetId,
  stayId,
  role,
  items,
  allowVideo = false,
  single = false,
  onChange,
}: {
  title: string;
  hint: string;
  target: "project" | "property";
  targetId: string;
  stayId?: string;
  role: MediaRole;
  items: MediaItem[];
  allowVideo?: boolean;
  single?: boolean;
  onChange: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const inputId = `upload-${role}-${stayId ?? targetId}`;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    setSaved("");
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.set("file", file);
        form.set("target", target);
        form.set("target_id", targetId);
        form.set("role", role);
        if (stayId) form.set("stay_id", stayId);
        const response = await fetch("/api/upload", { method: "POST", body: form });
        const body = (await response.json().catch(() => null)) as {
          ok?: boolean;
          message?: string;
        } | null;
        if (!body?.ok) {
          setError(`${file.name}: ${body?.message ?? "não foi possível enviar."}`);
          break;
        }
      }
      await onChange();
    } catch {
      setError("Não foi possível enviar. Verifique a conexão e tente novamente.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function act(work: () => Promise<unknown>, success = "") {
    setError("");
    setSaved(success);
    try {
      await work();
      await onChange();
    } catch {
      setSaved("");
      setError("Não foi possível concluir. Tente novamente.");
    }
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <Label htmlFor={inputId} className="font-semibold text-primary">
        {title}
      </Label>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      <input
        ref={input}
        id={inputId}
        type="file"
        multiple={!single}
        disabled={busy}
        accept={
          allowVideo
            ? "image/jpeg,image/png,image/webp,video/mp4,video/webm"
            : "image/jpeg,image/png,image/webp"
        }
        onChange={(e) => void upload(e.target.files)}
        className="mt-3 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-2 file:font-medium file:text-primary"
      />
      {busy && (
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Enviando...
        </p>
      )}
      {saved && (
        <p role="status" className="mt-2 text-sm text-primary">
          {saved}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {items.length > 0 && (
        <ul className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex flex-wrap items-start gap-3 rounded-lg bg-secondary p-3"
            >
              {item.kind === "video" ? (
                <video
                  src={`/media/${item.id}`}
                  preload="metadata"
                  muted
                  aria-label="Vídeo enviado"
                  className="h-20 w-28 rounded object-cover"
                />
              ) : (
                <img
                  src={`/media/${item.id}`}
                  alt={item.alt || "Imagem enviada"}
                  className="h-20 w-28 rounded object-cover"
                />
              )}
              <form
                className="grid min-w-52 flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  void act(
                    () =>
                      updateMediaItem({
                        data: {
                          id: item.id,
                          alt: String(fd.get("alt")),
                          description: String(fd.get("description")),
                        },
                      }),
                    "Texto salvo.",
                  );
                }}
              >
                <div className="grid gap-1">
                  <Label htmlFor={`alt-${item.id}`} className="text-xs">
                    Descrição para quem não vê a imagem
                  </Label>
                  <Input id={`alt-${item.id}`} name="alt" defaultValue={item.alt} maxLength={200} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor={`desc-${item.id}`} className="text-xs">
                    Legenda (opcional)
                  </Label>
                  <Input
                    id={`desc-${item.id}`}
                    name="description"
                    defaultValue={item.description}
                    maxLength={300}
                  />
                </div>
                <Button type="submit" variant="outline" size="sm" className="justify-self-start">
                  Salvar texto
                </Button>
              </form>
              <div className="flex gap-1">
                {!single && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={index === 0}
                      aria-label={`Mover item ${index + 1} para cima`}
                      onClick={() =>
                        void act(() => moveMediaItem({ data: { id: item.id, direction: "up" } }))
                      }
                    >
                      <ArrowUp aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={index === items.length - 1}
                      aria-label={`Mover item ${index + 1} para baixo`}
                      onClick={() =>
                        void act(() => moveMediaItem({ data: { id: item.id, direction: "down" } }))
                      }
                    >
                      <ArrowDown aria-hidden="true" />
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Remover item ${index + 1}`}
                  onClick={() =>
                    void act(() => deleteMediaItem({ data: { id: item.id } }), "Arquivo removido.")
                  }
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createBaseProject,
  deleteBaseProject,
  listBaseProjects,
  updateBaseProject,
} from "@/lib/api";
import { baseProjectSchema, type BaseProject as Project } from "@/lib/schemas";

type LoadState = "loading" | "ready" | "error";

export function BaseProjectsEditor() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    try {
      setProjects(await listBaseProjects());
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(project: Project) {
    setNotice("");
    setActionError("");
    try {
      await deleteBaseProject({ data: { id: project.id } });
    } catch {
      return setActionError("Não foi possível excluir. Tente novamente.");
    }
    setNotice(`"${project.title}" foi excluído.`);
    await load();
  }

  async function togglePublished(project: Project) {
    setNotice("");
    setActionError("");
    try {
      await updateBaseProject({
        data: {
          id: project.id,
          title: project.title,
          description: project.description,
          demo_url: project.demo_url,
          sort_order: project.sort_order,
          is_published: !project.is_published,
        },
      });
    } catch {
      return setActionError("Não foi possível alterar a publicação. Tente novamente.");
    }
    setNotice(
      project.is_published
        ? `"${project.title}" saiu do site.`
        : `"${project.title}" está no site.`,
    );
    await load();
  }

  return (
    <section
      aria-labelledby="projects-title"
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="projects-title" className="text-2xl font-bold text-primary">
            Projetos base
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Aparecem na seção Projetos do site apenas quando publicados. Use só demonstrações sem
            dados reais de clientes.
          </p>
        </div>
        {editing === null && (
          <Button
            onClick={() => {
              setNotice("");
              setActionError("");
              setEditing("new");
            }}
          >
            Adicionar projeto
          </Button>
        )}
      </div>

      {notice && (
        <p role="status" className="mt-4 text-sm font-medium text-primary">
          {notice}
        </p>
      )}
      {actionError && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {actionError}
        </p>
      )}

      {editing !== null && (
        <ProjectForm
          key={editing === "new" ? "new" : editing.id}
          project={editing === "new" ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={async (message) => {
            setEditing(null);
            setNotice(message);
            await load();
          }}
        />
      )}

      <div className="mt-6">
        {state === "loading" && <p>Carregando...</p>}
        {state === "error" && (
          <div role="alert">
            <p className="text-destructive">Não foi possível carregar os projetos.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        )}
        {state === "ready" && projects.length === 0 && editing === null && (
          <p className="text-muted-foreground">
            Nenhum projeto cadastrado. Use "Adicionar projeto" para incluir o primeiro link de
            demonstração.
          </p>
        )}
        {state === "ready" && projects.length > 0 && (
          <ul className="divide-y divide-border">
            {projects.map((p) => (
              <li key={p.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1 basis-64">
                  <p className="font-semibold text-primary">
                    {p.title}{" "}
                    <span className="ml-1 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {p.is_published ? "Publicado" : "Rascunho"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  <a
                    href={p.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex max-w-full items-center gap-1 text-sm text-primary underline"
                  >
                    <span className="truncate">{p.demo_url}</span>
                    <ExternalLink aria-hidden="true" className="h-3 w-3 shrink-0" />
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => void togglePublished(p)}>
                    {p.is_published ? "Tirar do site" : "Publicar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Editar ${p.title}`}
                    onClick={() => setEditing(p)}
                  >
                    <Pencil aria-hidden="true" /> Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" aria-label={`Excluir ${p.title}`}>
                        <Trash2 aria-hidden="true" /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir "{p.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          O projeto sai do painel e do site. Uma cópia dos dados fica no histórico
                          interno.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void remove(p)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function ProjectForm({
  project,
  onCancel,
  onSaved,
}: {
  project: Project | null;
  onCancel: () => void;
  onSaved: (message: string) => Promise<void>;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = baseProjectSchema.safeParse({
      title: fd.get("title"),
      description: fd.get("description"),
      demo_url: fd.get("demo_url"),
      sort_order: fd.get("sort_order"),
      is_published: fd.get("is_published") === "on",
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => (next[String(issue.path[0])] = issue.message));
      setErrors(next);
      return;
    }
    setErrors({});
    setFormError("");
    setSaving(true);
    try {
      if (project) await updateBaseProject({ data: { ...parsed.data, id: project.id } });
      else await createBaseProject({ data: parsed.data });
    } catch {
      setSaving(false);
      return setFormError("Não foi possível salvar. Confira os campos e tente novamente.");
    }
    setSaving(false);
    await onSaved(`"${parsed.data.title}" foi salvo.`);
  }

  const invalid = (id: string) =>
    errors[id] ? { "aria-invalid": true, "aria-describedby": `${id}-err` } : {};
  const message = (id: string) =>
    errors[id] ? (
      <p id={`${id}-err`} className="text-sm text-destructive">
        {errors[id]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mt-6 grid gap-4 rounded-xl border border-border bg-secondary p-5"
    >
      <h3 className="text-lg font-semibold text-primary">
        {project ? "Editar projeto" : "Novo projeto"}
      </h3>
      <div className="grid gap-1.5">
        <Label htmlFor="title">Nome *</Label>
        <Input
          id="title"
          name="title"
          defaultValue={project?.title}
          maxLength={80}
          {...invalid("title")}
        />
        {message("title")}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={project?.description}
          rows={3}
          maxLength={300}
          {...invalid("description")}
        />
        {message("description")}
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div className="grid gap-1.5">
          <Label htmlFor="demo_url">Link da demonstração *</Label>
          <Input
            id="demo_url"
            name="demo_url"
            type="url"
            inputMode="url"
            placeholder="https://"
            defaultValue={project?.demo_url}
            maxLength={500}
            {...invalid("demo_url")}
          />
          {message("demo_url")}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="sort_order">Ordem</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            min={0}
            max={9999}
            defaultValue={project?.sort_order ?? 0}
            {...invalid("sort_order")}
          />
          {message("sort_order")}
        </div>
      </div>
      <div className="flex items-start gap-2">
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          className="mt-1 h-4 w-4 accent-primary"
          defaultChecked={project?.is_published ?? false}
        />
        <Label htmlFor="is_published" className="font-normal leading-snug">
          Mostrar no site público
        </Label>
      </div>
      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

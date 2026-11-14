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
import {
  createBaseProject,
  deleteBaseProject,
  listBaseProjects,
  updateBaseProject,
} from "@/lib/api";
import {
  baseProjectSchema,
  type BaseProject as Project,
  type PublicationStatus,
} from "@/lib/schemas";
import { portfolio } from "@/content/site";
import { MediaManager } from "./MediaManager";
import {
  SelectField,
  StatusBadge,
  STATUS_OPTIONS,
  TextAreaField,
  TextField,
  zodErrors,
} from "./fields";

type LoadState = "loading" | "ready" | "error";

const STATUS_MESSAGE: Record<PublicationStatus, string> = {
  published: "foi publicado no site deste servidor",
  draft: "voltou a ser rascunho e saiu do site",
  archived: "foi arquivado e saiu do site",
};

export function BaseProjectsEditor() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [editing, setEditing] = useState<string | "new" | null>(null);
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

  async function changeStatus(project: Project, status: PublicationStatus) {
    setNotice("");
    setActionError("");
    try {
      const result = await updateBaseProject({
        data: {
          id: project.id,
          title: project.title,
          slug: project.slug,
          description: project.description,
          problem: project.problem,
          features: project.features,
          demo_url: project.demo_url ?? "",
          sort_order: project.sort_order,
          kind: project.kind,
          category: project.category,
          client: project.client,
          results: project.results,
          status,
        },
      });
      if (!result.ok) return setActionError(result.message);
    } catch {
      return setActionError("Não foi possível alterar a publicação. Tente novamente.");
    }
    setNotice(`"${project.title}" ${STATUS_MESSAGE[status]}.`);
    await load();
  }

  const current = projects.find((p) => p.id === editing) ?? null;

  return (
    <section
      aria-labelledby="projects-title"
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="projects-title" className="text-2xl font-bold text-primary">
            Projetos
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Só os publicados aparecem na página inicial. Rascunhos e arquivados ficam visíveis
            apenas aqui. Use só demonstrações sem dados reais de clientes.
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
          key={editing}
          project={current}
          onCancel={() => setEditing(null)}
          onReload={load}
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
            Nenhum projeto cadastrado. Use "Adicionar projeto" para incluir o primeiro.
          </p>
        )}
        {state === "ready" && projects.length > 0 && (
          <ul className="divide-y divide-border">
            {projects.map((p) => (
              <li key={p.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1 basis-64">
                  <p className="font-semibold text-primary">
                    {p.title} <StatusBadge status={p.status} />
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 text-sm">
                    <a
                      href={`/projetos/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary underline"
                    >
                      {p.status === "published" ? "Ver página" : "Pré-visualizar"}
                      <ExternalLink aria-hidden="true" className="h-3 w-3" />
                    </a>
                    {p.demo_url && (
                      <a
                        href={p.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-1 text-primary underline"
                      >
                        <span className="truncate">{p.demo_url}</span>
                        <ExternalLink aria-hidden="true" className="h-3 w-3 shrink-0" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.status === "published" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Tirar ${p.title} do site`}
                      onClick={() => void changeStatus(p, "draft")}
                    >
                      Tirar do site
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      aria-label={`Publicar ${p.title}`}
                      onClick={() => void changeStatus(p, "published")}
                    >
                      Publicar
                    </Button>
                  )}
                  {p.status !== "archived" && (
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Arquivar ${p.title}`}
                      onClick={() => void changeStatus(p, "archived")}
                    >
                      Arquivar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Editar ${p.title}`}
                    onClick={() => setEditing(p.id)}
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
                          O projeto e a imagem dele saem do painel e do site. Se quiser só tirar do
                          ar, use "Arquivar".
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
  onReload,
}: {
  project: Project | null;
  onCancel: () => void;
  onSaved: (message: string) => Promise<void>;
  onReload: () => Promise<void>;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = baseProjectSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return setErrors(zodErrors(parsed.error.issues));
    setErrors({});
    setFormError("");
    setSaving(true);
    try {
      const result = project
        ? await updateBaseProject({ data: { ...parsed.data, id: project.id } })
        : await createBaseProject({ data: parsed.data });
      if (!result.ok) return setErrors({ [result.field]: result.message });
      await onSaved(
        `"${parsed.data.title}" foi salvo como ${parsed.data.status === "published" ? "publicado" : parsed.data.status === "archived" ? "arquivado" : "rascunho"}.`,
      );
    } catch {
      setFormError("Não foi possível salvar. Confira os campos e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const common = { prefix: "project", errors };
  return (
    <div className="mt-6 grid gap-4 rounded-xl border border-border bg-secondary p-5">
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <h3 className="text-lg font-semibold text-primary">
          {project ? "Editar projeto" : "Novo projeto"}
        </h3>
        <TextField
          {...common}
          name="title"
          label="Nome *"
          value={project?.title ?? ""}
          maxLength={80}
        />
        <TextField
          {...common}
          name="slug"
          label="Endereço da página"
          value={project?.slug ?? ""}
          maxLength={80}
          hint="Em branco, é criado a partir do nome. Exemplo: arua-hospedagens"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            {...common}
            name="kind"
            label="Tipo"
            value={project?.kind ?? "product"}
            options={Object.entries(portfolio.kinds)}
            hint="Produto da Aruá aparece na página inicial; case de cliente, só no portfólio."
          />
          <SelectField
            {...common}
            name="category"
            label="Categoria no portfólio"
            value={project?.category ?? "sistema"}
            options={Object.entries(portfolio.categories)}
          />
        </div>
        <TextField
          {...common}
          name="client"
          label="Cliente"
          value={project?.client ?? ""}
          maxLength={120}
          hint="Só com autorização do cliente. Em branco para produtos da Aruá."
        />
        <TextAreaField
          {...common}
          name="description"
          label="Descrição comercial *"
          value={project?.description ?? ""}
          maxLength={300}
        />
        <TextAreaField
          {...common}
          name="problem"
          label="Problema que resolve"
          value={project?.problem ?? ""}
          maxLength={800}
        />
        <TextAreaField
          {...common}
          name="features"
          label="Principais funcionalidades"
          value={project?.features ?? ""}
          maxLength={2000}
          rows={5}
          hint="Uma por linha."
        />
        <TextAreaField
          {...common}
          name="results"
          label="Resultados"
          value={project?.results ?? ""}
          maxLength={2000}
          rows={4}
          hint="Um por linha. Só resultados reais e comprováveis; nunca estimativas."
        />
        <TextField
          {...common}
          name="demo_url"
          label="Link da demonstração"
          value={project?.demo_url ?? ""}
          maxLength={500}
          placeholder="https://"
          hint="Endereço https:// completo, ou uma página deste site, como /hospedagens/demonstracao."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            {...common}
            name="status"
            label="Situação"
            value={project?.status ?? "draft"}
            options={STATUS_OPTIONS}
          />
          <TextField
            {...common}
            name="sort_order"
            label="Ordem"
            type="number"
            value={project?.sort_order ?? 0}
          />
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
      {project ? (
        <MediaManager
          title="Imagem de apresentação"
          hint="JPG, PNG ou WebP, até 8 MB. Uma nova imagem substitui a atual."
          target="project"
          targetId={project.id}
          role="cover"
          single
          items={
            project.image_id
              ? [
                  {
                    id: project.image_id,
                    role: "cover",
                    kind: "image",
                    alt: "",
                    description: "",
                    stay_id: null,
                  },
                ]
              : []
          }
          onChange={onReload}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Depois de salvar, use "Editar" para enviar a imagem de apresentação.
        </p>
      )}
    </div>
  );
}

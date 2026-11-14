// Depoimentos: só vão ao ar com a autorização de quem falou (o banco também confere).
import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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
import { deleteTestimonial, listBaseProjects, listTestimonials, saveTestimonial } from "@/lib/api";
import { testimonialSchema, type BaseProject, type Testimonial } from "@/lib/schemas";
import {
  SelectField,
  StatusBadge,
  STATUS_OPTIONS,
  TextAreaField,
  TextField,
  zodErrors,
} from "./fields";

export function TestimonialsEditor() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [projects, setProjects] = useState<BaseProject[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    try {
      const [list, projectList] = await Promise.all([listTestimonials(), listBaseProjects()]);
      setItems(list);
      setProjects(projectList);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(t: Testimonial) {
    setNotice("");
    setActionError("");
    try {
      await deleteTestimonial({ data: { id: t.id } });
      setNotice("Depoimento excluído.");
      await load();
    } catch {
      setActionError("Não foi possível excluir. Tente novamente.");
    }
  }

  const current = items.find((t) => t.id === editing) ?? null;
  const projectTitle = (id: string | null) => projects.find((p) => p.id === id)?.title;

  return (
    <section
      aria-labelledby="testimonials-title"
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="testimonials-title" className="text-2xl font-bold text-primary">
            Depoimentos
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Só depoimentos reais, com autorização de quem falou. Sem nenhum publicado, a seção não
            aparece no site.
          </p>
        </div>
        {editing === null && (
          <Button onClick={() => setEditing("new")}>Adicionar depoimento</Button>
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
        <TestimonialForm
          key={editing}
          item={current}
          projects={projects}
          onCancel={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            setNotice("Depoimento salvo.");
            await load();
          }}
        />
      )}

      <div className="mt-6">
        {state === "loading" && <p>Carregando...</p>}
        {state === "error" && (
          <div role="alert">
            <p className="text-destructive">Não foi possível carregar os depoimentos.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        )}
        {state === "ready" && items.length === 0 && editing === null && (
          <p className="text-muted-foreground">Nenhum depoimento cadastrado.</p>
        )}
        {state === "ready" && items.length > 0 && (
          <ul className="divide-y divide-border">
            {items.map((t) => (
              <li key={t.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1 basis-64">
                  <p className="font-semibold text-primary">
                    {t.author} <StatusBadge status={t.status} />
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">“{t.quote}”</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[
                      t.role,
                      projectTitle(t.project_id),
                      t.authorized ? "Autorizado" : "Sem autorização",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(t.id)}
                    aria-label={`Editar depoimento de ${t.author}`}
                  >
                    <Pencil aria-hidden="true" /> Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={`Excluir depoimento de ${t.author}`}
                      >
                        <Trash2 aria-hidden="true" /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir o depoimento de {t.author}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ele sai do painel e do site.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void remove(t)}>
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

function TestimonialForm({
  item,
  projects,
  onCancel,
  onSaved,
}: {
  item: Testimonial | null;
  projects: BaseProject[];
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = testimonialSchema.safeParse({
      ...Object.fromEntries(fd),
      authorized: fd.get("authorized") === "on",
    });
    if (!parsed.success) return setErrors(zodErrors(parsed.error.issues));
    setErrors({});
    setFormError("");
    setSaving(true);
    try {
      const result = await saveTestimonial({ data: { ...parsed.data, id: item?.id ?? null } });
      if (!result.ok) return setErrors({ [result.field]: result.message });
      await onSaved();
    } catch {
      setFormError("Não foi possível salvar. Confira os campos e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const common = { prefix: "testimonial", errors };
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mt-6 grid gap-4 rounded-xl border border-border bg-secondary p-5"
    >
      <h3 className="text-lg font-semibold text-primary">
        {item ? "Editar depoimento" : "Novo depoimento"}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          {...common}
          name="author"
          label="Nome de quem falou *"
          value={item?.author ?? ""}
          maxLength={100}
        />
        <TextField
          {...common}
          name="role"
          label="Cargo e empresa"
          value={item?.role ?? ""}
          maxLength={120}
          hint="Exemplo: Proprietária da Pousada X"
        />
      </div>
      <TextAreaField
        {...common}
        name="quote"
        label="Depoimento *"
        value={item?.quote ?? ""}
        maxLength={600}
        rows={4}
        hint="Com as palavras da pessoa, sem acrescentar nada."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          {...common}
          name="project_id"
          label="Projeto relacionado"
          value={item?.project_id ?? ""}
          options={[["", "Nenhum"], ...projects.map((p): [string, string] => [p.id, p.title])]}
        />
        <SelectField
          {...common}
          name="status"
          label="Situação"
          value={item?.status ?? "draft"}
          options={STATUS_OPTIONS}
        />
        <TextField
          {...common}
          name="sort_order"
          label="Ordem"
          type="number"
          value={item?.sort_order ?? 0}
        />
      </div>
      <div className="grid gap-1">
        <div className="flex items-start gap-2">
          <input
            id="testimonial-authorized"
            name="authorized"
            type="checkbox"
            defaultChecked={item?.authorized ?? false}
            className="mt-1 h-4 w-4 accent-primary"
            {...(errors["authorized"]
              ? { "aria-invalid": true, "aria-describedby": "testimonial-authorized-err" }
              : {})}
          />
          <label htmlFor="testimonial-authorized" className="text-sm leading-snug">
            A pessoa autorizou por escrito o uso deste depoimento e do nome dela no site.
          </label>
        </div>
        {errors["authorized"] && (
          <p id="testimonial-authorized-err" className="text-sm text-destructive">
            {errors["authorized"]}
          </p>
        )}
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

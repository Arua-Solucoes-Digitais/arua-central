// Sistemas no ar: onde cada projeto roda ao vivo e se está respondendo.
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Pencil, RefreshCw, Trash2 } from "lucide-react";
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
import { LiveBadge } from "@/components/site/Sections";
import { environments } from "@/content/site";
import {
  checkDeployments,
  deleteDeployment,
  listBaseProjects,
  listDeployments,
  saveDeployment,
} from "@/lib/api";
import { deploymentSchema, type BaseProject, type Deployment } from "@/lib/schemas";
import { SelectField, TextAreaField, TextField, zodErrors } from "./fields";

const MODES: [string, string][] = [
  ["planned", "Em preparação (ainda não hospedado)"],
  ["active", "Ativo (verificar automaticamente)"],
  ["maintenance", "Em manutenção"],
];

export function DeploymentsEditor() {
  const [items, setItems] = useState<Deployment[]>([]);
  const [projects, setProjects] = useState<BaseProject[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [checking, setChecking] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    try {
      const [list, projectList] = await Promise.all([listDeployments(), listBaseProjects()]);
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

  async function check(id?: string) {
    setNotice("");
    setActionError("");
    setChecking(id ?? "all");
    try {
      const results = await checkDeployments({ data: id ? { id } : {} });
      const down = results.filter((r) => !r.ok).length;
      setNotice(
        results.length === 0
          ? "Nenhum sistema ativo para verificar."
          : down === 0
            ? `${results.length} verificado(s): todos no ar.`
            : `${results.length} verificado(s): ${down} fora do ar.`,
      );
      await load();
    } catch {
      setActionError("Não foi possível verificar. Tente novamente.");
    } finally {
      setChecking(null);
    }
  }

  async function remove(d: Deployment) {
    setNotice("");
    setActionError("");
    try {
      await deleteDeployment({ data: { id: d.id } });
      setNotice("Sistema removido.");
      await load();
    } catch {
      setActionError("Não foi possível remover. Tente novamente.");
    }
  }

  const current = items.find((d) => d.id === editing) ?? null;

  return (
    <section
      aria-labelledby="deployments-title"
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="deployments-title" className="text-2xl font-bold text-primary">
            Sistemas no ar
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Onde cada projeto roda ao vivo. Os ativos são verificados aqui ou pelo comando{" "}
            <code>npm run status</code> (no servidor, pelo cron a cada 5 minutos). A situação no
            site vem sempre da última verificação. Aparecem em /status e no portfólio só os marcados
            como públicos, de projetos publicados.
          </p>
        </div>
        {editing === null && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={checking !== null} onClick={() => void check()}>
              <RefreshCw aria-hidden="true" className={checking === "all" ? "animate-spin" : ""} />
              Verificar todos
            </Button>
            <Button onClick={() => setEditing("new")} disabled={projects.length === 0}>
              Adicionar sistema
            </Button>
          </div>
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
        <DeploymentForm
          key={editing}
          item={current}
          projects={projects}
          onCancel={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            setNotice("Sistema salvo.");
            await load();
          }}
        />
      )}

      <div className="mt-6">
        {state === "loading" && <p>Carregando...</p>}
        {state === "error" && (
          <div role="alert">
            <p className="text-destructive">Não foi possível carregar os sistemas.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        )}
        {state === "ready" && items.length === 0 && editing === null && (
          <p className="text-muted-foreground">
            {projects.length === 0
              ? "Cadastre um projeto primeiro; depois informe aqui onde ele está hospedado."
              : 'Nenhum sistema cadastrado. Use "Adicionar sistema" quando um projeto estiver hospedado.'}
          </p>
        )}
        {state === "ready" && items.length > 0 && (
          <ul className="divide-y divide-border">
            {items.map((d) => (
              <li key={d.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1 basis-64">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-primary">
                    {d.project_title}
                    <span className="font-normal text-muted-foreground">
                      · {environments[d.environment]}
                    </span>
                    <LiveBadge state={d.state} />
                    {!d.is_public && (
                      <span className="text-xs text-muted-foreground">(interno)</span>
                    )}
                  </p>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex max-w-full items-center gap-1 text-sm text-primary underline"
                  >
                    <span className="truncate">{d.url}</span>
                    <ExternalLink aria-hidden="true" className="h-3 w-3 shrink-0" />
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d.host && `${d.host} · `}
                    {d.last_checked_at
                      ? `Última verificação ${new Date(d.last_checked_at).toLocaleString("pt-BR")}: ${d.last_http_status ?? "sem resposta"}${d.last_latency_ms !== null ? `, ${d.last_latency_ms} ms` : ""}`
                      : "Ainda não verificado"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.mode === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={checking !== null}
                      onClick={() => void check(d.id)}
                      aria-label={`Verificar ${d.project_title}`}
                    >
                      <RefreshCw
                        aria-hidden="true"
                        className={checking === d.id ? "animate-spin" : ""}
                      />{" "}
                      Verificar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(d.id)}
                    aria-label={`Editar ${d.project_title}`}
                  >
                    <Pencil aria-hidden="true" /> Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" aria-label={`Remover ${d.project_title}`}>
                        <Trash2 aria-hidden="true" /> Remover
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover este sistema?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Sai do painel, do portfólio e da página de status, com o histórico de
                          verificações. O sistema em si continua hospedado onde está.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void remove(d)}>
                          Remover
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

function DeploymentForm({
  item,
  projects,
  onCancel,
  onSaved,
}: {
  item: Deployment | null;
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
    const parsed = deploymentSchema.safeParse({
      ...Object.fromEntries(fd),
      is_public: fd.get("is_public") === "on",
    });
    if (!parsed.success) return setErrors(zodErrors(parsed.error.issues));
    setErrors({});
    setFormError("");
    setSaving(true);
    try {
      const result = await saveDeployment({ data: { ...parsed.data, id: item?.id ?? null } });
      if (!result.ok) return setErrors({ [result.field]: result.message });
      await onSaved();
    } catch {
      setFormError("Não foi possível salvar. Confira os campos e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const common = { prefix: "deployment", errors };
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mt-6 grid gap-4 rounded-xl border border-border bg-secondary p-5"
    >
      <h3 className="text-lg font-semibold text-primary">
        {item ? "Editar sistema" : "Novo sistema"}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          {...common}
          name="project_id"
          label="Projeto *"
          value={item?.project_id ?? projects[0]?.id ?? ""}
          options={projects.map((p) => [p.id, p.title])}
        />
        <SelectField
          {...common}
          name="environment"
          label="Ambiente"
          value={item?.environment ?? "production"}
          options={Object.entries(environments)}
          hint="Produção é o sistema real; demonstração, a versão para apresentar."
        />
      </div>
      <TextField
        {...common}
        name="url"
        label="Endereço do sistema *"
        value={item?.url ?? ""}
        maxLength={500}
        placeholder="https://"
        inputMode="url"
      />
      <TextField
        {...common}
        name="health_url"
        label="Endereço de verificação"
        value={item?.health_url ?? ""}
        maxLength={500}
        placeholder="https://"
        inputMode="url"
        hint="Opcional. Uma página leve que responde se o sistema está bem, como https://.../saude. Em branco, verifica o endereço do sistema."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          {...common}
          name="mode"
          label="Situação"
          value={item?.mode ?? "planned"}
          options={MODES}
        />
        <TextField
          {...common}
          name="host"
          label="Onde está hospedado"
          value={item?.host ?? ""}
          maxLength={80}
          hint="Exemplo: VPS Hostinger, Railway."
        />
      </div>
      <TextAreaField
        {...common}
        name="notes"
        label="Anotações internas"
        value={item?.notes ?? ""}
        maxLength={500}
        hint="Não aparecem no site."
      />
      <div className="flex items-start gap-2">
        <input
          id="deployment-is_public"
          name="is_public"
          type="checkbox"
          defaultChecked={item?.is_public ?? true}
          className="mt-1 h-4 w-4 accent-primary"
        />
        <label htmlFor="deployment-is_public" className="text-sm leading-snug">
          Mostrar no portfólio e na página de status (quando o projeto estiver publicado)
        </label>
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

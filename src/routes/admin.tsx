import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getCurrentUser,
  getDashboard,
  setMessageRead,
  signIn,
  signOut,
} from "@/lib/api";
import type { AdminMessage as Msg, VisitStats as Stats } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Shapes";
import { BaseProjectsEditor } from "@/components/admin/BaseProjectsEditor";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Área do administrador — Aruá" },
      { name: "description", content: "Acesso restrito da equipe Aruá." },
      { property: "og:title", content: "Área do administrador — Aruá" },
      { property: "og:description", content: "Acesso restrito." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    getCurrentUser()
      .then((user) => setEmail(user?.email ?? null))
      .catch(() => setEmail(null));
  }, []);

  async function leave() {
    await signOut();
    setEmail(null);
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" aria-label="Voltar ao site"><Logo /></Link>
          {email && <Button variant="outline" onClick={() => void leave()}>Sair</Button>}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        {email === undefined ? (
          <p>Carregando...</p>
        ) : email ? (
          <Dashboard onExpired={() => setEmail(null)} />
        ) : (
          <Login onDone={setEmail} />
        )}
      </main>
    </div>
  );
}

function Login({ onDone }: { onDone: (email: string) => void }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const result = await signIn({
        data: { email: String(fd.get("email")), password: String(fd.get("password")) },
      });
      if (result.status === "ok") return onDone(result.email);
      setError(
        result.status === "locked"
          ? "Muitas tentativas. Aguarde 15 minutos ou troque a senha pelo terminal."
          : "E-mail ou senha incorretos.",
      );
    } catch {
      setError("Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-sm gap-4 rounded-2xl border border-border bg-card p-8 shadow-soft">
      <h1 className="text-2xl font-bold text-primary">Entrar</h1>
      <div className="grid gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
      {forgot ? (
        <p role="status" className="text-sm text-muted-foreground">
          Para criar ou trocar a senha, rode <code>npm run admin</code> no terminal, dentro da pasta do projeto.
        </p>
      ) : (
        <Button type="button" variant="link" onClick={() => setForgot(true)}>Esqueci minha senha</Button>
      )}
    </form>
  );
}

function Dashboard({ onExpired }: { onExpired: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [actionError, setActionError] = useState("");

  async function load() {
    try {
      const data = await getDashboard();
      setMsgs(data.messages);
      setStats(data.stats);
      setState("ready");
    } catch {
      // A causa mais comum é a sessão ter vencido; se não for, o aviso aparece aqui.
      const user = await getCurrentUser().catch(() => undefined);
      if (user === null) return onExpired();
      setState("error");
    }
  }
  useEffect(() => { void load(); }, []);

  async function toggleRead(m: Msg) {
    setActionError("");
    try {
      await setMessageRead({ data: { id: m.id, read: !m.read } });
      setMsgs((list) => list.map((x) => (x.id === m.id ? { ...x, read: !x.read } : x)));
    } catch {
      setActionError("Não foi possível alterar a mensagem. Tente novamente.");
    }
  }

  if (state === "loading") return <p>Carregando...</p>;
  if (state === "error") {
    return (
      <div role="alert">
        <p className="text-destructive">Não foi possível carregar a Área restrita.</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => void load()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold text-primary">Área restrita</h1>
      <BaseProjectsEditor />
      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="mb-4 text-2xl font-bold text-primary">Visitas (últimos 30 dias)</h2>
        {stats && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Visitas" value={stats.views} />
            <Stat label="Cliques" value={stats.clicks} />
            <Stat label="Visitas pelo celular" value={stats.mobile} />
          </div>
        )}
        {stats && stats.topClicks.length > 0 && (
          <ul className="mt-4 rounded-xl border border-border bg-card p-4 text-sm">
            {stats.topClicks.map(([l, n]) => (
              <li key={l} className="flex justify-between py-1"><span>{l}</span><span className="font-semibold">{n}</span></li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="msgs-title">
        <h2 id="msgs-title" className="mb-4 text-2xl font-bold text-primary">Mensagens de contato ({msgs.length})</h2>
        {actionError && <p role="alert" className="mb-4 text-sm text-destructive">{actionError}</p>}
        {msgs.length === 0 && <p className="text-muted-foreground">Nenhuma mensagem ainda.</p>}
        <ul className="space-y-4">
          {msgs.map((m) => (
            <li key={m.id} className={`rounded-xl border bg-card p-5 ${m.read ? "border-border opacity-70" : "border-accent"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-primary">{m.name}</p>
                <time className="text-sm text-muted-foreground">{new Date(m.created_at).toLocaleString("pt-BR")}</time>
              </div>
              <p className="text-sm"><a className="text-accent underline" href={`mailto:${m.email}`}>{m.email}</a>{m.phone ? ` · ${m.phone}` : ""}</p>
              <p className="mt-3 whitespace-pre-wrap">{m.message}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => void toggleRead(m)}>
                {m.read ? "Marcar como não lida" : "Marcar como lida"}
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-bold text-primary">{value}</p>
    </div>
  );
}

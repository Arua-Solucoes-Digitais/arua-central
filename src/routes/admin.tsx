import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Shapes";

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
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" aria-label="Voltar ao site"><Logo /></Link>
          {session && <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sair</Button>}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        {session === undefined ? <p>Carregando...</p> : session ? <Dashboard userId={session.user.id} /> : <Login />}
      </main>
    </div>
  );
}

function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) setError("E-mail ou senha incorretos.");
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
    </form>
  );
}

type Msg = { id: string; name: string; email: string; phone: string | null; message: string; read: boolean; created_at: string };
type Stats = { views: number; clicks: number; mobile: number; topClicks: [string, number][] };

function Dashboard({ userId }: { userId: string }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  async function load() {
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!role) return setIsAdmin(false);
    setIsAdmin(true);
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMsgs((data as Msg[]) ?? []);
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const { data: ev } = await supabase.from("analytics_events").select("event_type,label,device").gte("created_at", since).limit(1000);
    const events = ev ?? [];
    const counts: Record<string, number> = {};
    events.filter((e) => e.event_type === "click").forEach((e) => (counts[e.label ?? "?"] = (counts[e.label ?? "?"] ?? 0) + 1));
    setStats({
      views: events.filter((e) => e.event_type === "pageview").length,
      clicks: events.filter((e) => e.event_type === "click").length,
      mobile: events.filter((e) => e.event_type === "pageview" && e.device === "mobile").length,
      topClicks: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5),
    });
  }
  useEffect(() => { void load(); }, [userId]);

  async function toggleRead(m: Msg) {
    await supabase.from("contact_messages").update({ read: !m.read }).eq("id", m.id);
    setMsgs((list) => list.map((x) => (x.id === m.id ? { ...x, read: !x.read } : x)));
  }

  if (isAdmin === null) return <p>Carregando...</p>;
  if (!isAdmin) return <p role="alert">Esta conta não tem permissão de administrador.</p>;

  return (
    <div className="space-y-10">
      <section aria-labelledby="stats-title">
        <h1 id="stats-title" className="mb-4 text-2xl font-bold text-primary">Visitas (últimos 30 dias)</h1>
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
              <Button variant="outline" size="sm" className="mt-3" onClick={() => toggleRead(m)}>
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

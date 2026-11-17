import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contact, plans } from "@/content/site";
import { sendContactMessage } from "@/lib/api";
import { contactSchema, contactTopicSchema, type ContactTopic } from "@/lib/schemas";
import { selectClass } from "@/components/admin/fields";

// O assunto e o plano podem vir do endereço: /?assunto=orcamento&plano=social#contato
export function ContactForm({
  defaultTopic = "orcamento",
  prefix = "",
}: {
  defaultTopic?: ContactTopic;
  prefix?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topic, setTopic] = useState<ContactTopic>(defaultTopic);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = contactTopicSchema.safeParse(params.get("assunto"));
    if (fromUrl.success) setTopic(fromUrl.data);
    const plan = plans.items.find((p) => p.id === params.get("plano"));
    if (plan) setMessage(`Tenho interesse no plano ${plan.name}.`);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = contactSchema.safeParse({
      topic: fd.get("topic"),
      name: fd.get("name"),
      email: fd.get("email"),
      phone: (fd.get("phone") as string) || undefined,
      message: fd.get("message"),
      consent: fd.get("consent") === "on",
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      await sendContactMessage({ data: parsed.data });
    } catch {
      return setStatus("error");
    }
    setStatus("ok");
    setMessage("");
    (e.target as HTMLFormElement).reset();
  }

  if (status === "ok") {
    return (
      <p
        role="status"
        className="rounded-xl border border-highlight bg-secondary p-6 font-medium text-primary"
      >
        {contact.success}
      </p>
    );
  }

  const id = (name: string) => `${prefix}${name}`;
  const field = (name: string) =>
    errors[name] ? { "aria-invalid": true, "aria-describedby": `${id(name)}-err` } : {};
  const err = (name: string) =>
    errors[name] ? (
      <p id={`${id(name)}-err`} className="text-sm text-destructive">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor={id("topic")}>{contact.topicLabel}</Label>
        <select
          id={id("topic")}
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value as ContactTopic)}
          className={selectClass}
        >
          {Object.entries(contact.topics).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor={id("name")}>Nome *</Label>
          <Input
            id={id("name")}
            name="name"
            autoComplete="name"
            maxLength={100}
            {...field("name")}
          />
          {err("name")}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={id("email")}>E-mail *</Label>
          <Input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={255}
            {...field("email")}
          />
          {err("email")}
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={id("phone")}>Telefone (opcional)</Label>
        <Input id={id("phone")} name="phone" type="tel" autoComplete="tel" maxLength={30} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={id("message")}>Mensagem *</Label>
        <Textarea
          id={id("message")}
          name="message"
          rows={5}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          {...field("message")}
        />
        {err("message")}
      </div>
      <div className="flex items-start gap-2">
        <input
          id={id("consent")}
          name="consent"
          type="checkbox"
          className="mt-1 h-4 w-4 accent-primary"
          {...field("consent")}
        />
        <Label htmlFor={id("consent")} className="font-normal leading-snug text-muted-foreground">
          Autorizo a Aruá a usar estes dados apenas para responder meu contato, conforme a{" "}
          <Link to="/privacidade" className="text-primary underline">
            Política de Privacidade
          </Link>
          .
        </Label>
      </div>
      {err("consent")}
      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível enviar. Tente novamente.
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        disabled={status === "sending"}
        data-track="enviar-contato"
        className="w-full sm:w-auto"
      >
        {status === "sending" ? "Enviando..." : "Enviar mensagem"}
      </Button>
    </form>
  );
}

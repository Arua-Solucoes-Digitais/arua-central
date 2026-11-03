import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contact } from "@/content/site";
import { sendContactMessage } from "@/lib/api";
import { contactSchema } from "@/lib/schemas";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = contactSchema.safeParse({
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
    (e.target as HTMLFormElement).reset();
  }

  if (status === "ok") {
    return (
      <p role="status" className="rounded-xl border border-highlight bg-secondary p-6 font-medium text-primary">
        {contact.success}
      </p>
    );
  }

  const field = (id: string) => (errors[id] ? { "aria-invalid": true, "aria-describedby": `${id}-err` } : {});
  const err = (id: string) =>
    errors[id] ? (
      <p id={`${id}-err`} className="text-sm text-destructive">{errors[id]}</p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" autoComplete="name" maxLength={100} {...field("name")} />
          {err("name")}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email">E-mail *</Label>
          <Input id="email" name="email" type="email" autoComplete="email" maxLength={255} {...field("email")} />
          {err("email")}
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="phone">Telefone (opcional)</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={30} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="message">Mensagem *</Label>
        <Textarea id="message" name="message" rows={5} maxLength={2000} {...field("message")} />
        {err("message")}
      </div>
      <div className="flex items-start gap-2">
        <input id="consent" name="consent" type="checkbox" className="mt-1 h-4 w-4 accent-primary" {...field("consent")} />
        <Label htmlFor="consent" className="font-normal leading-snug text-muted-foreground">
          Autorizo a Aruá a usar estes dados apenas para responder meu contato, conforme a{" "}
          <Link to="/privacidade" className="text-primary underline">Política de Privacidade</Link>.
        </Label>
      </div>
      {err("consent")}
      {status === "error" && (
        <p role="alert" className="text-sm text-destructive">Não foi possível enviar. Tente novamente.</p>
      )}
      <Button type="submit" size="lg" disabled={status === "sending"} data-track="enviar-contato" className="w-full sm:w-auto">
        {status === "sending" ? "Enviando..." : "Enviar mensagem"}
      </Button>
    </form>
  );
}

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contact, contactInfo, plans } from "@/content/site";
import { IS_PUBLIC_SITE } from "@/lib/demo-mode";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { sendContactMessage } from "@/lib/api";
import { contactSchema, contactTopicSchema, type ContactTopic } from "@/lib/schemas";
import { selectClass } from "@/components/admin/fields";

type Props = { defaultTopic?: ContactTopic; prefix?: string };

export function ContactForm(props: Props) {
  return IS_PUBLIC_SITE ? <WhatsappContact {...props} /> : <ServerContactForm {...props} />;
}

// O assunto e o plano podem vir do endereço: /?assunto=orcamento&plano=social#contato
function useTopicAndMessage(defaultTopic: ContactTopic) {
  const [topic, setTopic] = useState<ContactTopic>(defaultTopic);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = contactTopicSchema.safeParse(params.get("assunto"));
    if (fromUrl.success) setTopic(fromUrl.data);
    const plan = plans.items.find((p) => p.id === params.get("plano"));
    if (plan) setMessage(`Tenho interesse no plano ${plan.name}.`);
  }, []);

  return { topic, setTopic, message, setMessage };
}

export function whatsappContactUrl(topic: ContactTopic, name: string, message: string) {
  const lines = [
    "Olá! Vim pelo site da Aruá.",
    `Assunto: ${contact.topics[topic]}`,
    name.trim() && `Nome: ${name.trim()}`,
    message.trim(),
  ];
  return buildWhatsappUrl(contactInfo.whatsapp, lines.filter(Boolean).join("\n"));
}

// Nada é guardado no site: o botão abre o WhatsApp com a mensagem pronta para a pessoa enviar.
export function WhatsappContact({ defaultTopic = "orcamento", prefix = "" }: Props) {
  const { topic, setTopic, message, setMessage } = useTopicAndMessage(defaultTopic);
  const [name, setName] = useState("");
  const id = (field: string) => `${prefix}${field}`;

  return (
    <div className="grid gap-4">
      <TopicField id={id("topic")} value={topic} onChange={setTopic} />
      <div className="grid gap-1.5">
        <Label htmlFor={id("name")}>Seu nome (opcional)</Label>
        <Input
          id={id("name")}
          autoComplete="name"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={id("message")}>Mensagem (opcional)</Label>
        <Textarea
          id={id("message")}
          rows={4}
          maxLength={1000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <Button asChild size="lg" className="w-full sm:w-auto">
        <a
          href={whatsappContactUrl(topic, name, message)}
          target="_blank"
          rel="noopener noreferrer"
          data-track="enviar-whatsapp"
        >
          {contact.whatsappCta}
        </a>
      </Button>
      <p className="text-sm text-muted-foreground">
        {contact.whatsappNote}{" "}
        <Link to="/privacidade" className="text-primary underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </div>
  );
}

function TopicField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: ContactTopic;
  onChange: (topic: ContactTopic) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{contact.topicLabel}</Label>
      <select
        id={id}
        name="topic"
        value={value}
        onChange={(e) => onChange(e.target.value as ContactTopic)}
        className={selectClass}
      >
        {Object.entries(contact.topics).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ServerContactForm({ defaultTopic = "orcamento", prefix = "" }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { topic, setTopic, message, setMessage } = useTopicAndMessage(defaultTopic);

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
      <TopicField id={id("topic")} value={topic} onChange={setTopic} />
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

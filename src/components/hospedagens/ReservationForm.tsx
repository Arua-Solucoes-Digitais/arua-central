import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { markReservationOpened, submitReservation } from "@/lib/api";
import { reservationSchema, type PropertyPage, type ReservationReceipt } from "@/lib/schemas";
import { formatDate } from "@/lib/whatsapp";

const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
const EMPTY = {
  check_in: "",
  check_out: "",
  guests: "2",
  name: "",
  phone: "",
  email: "",
  notes: "",
};

export function ReservationForm({
  property,
  stayId,
  onStayChange,
}: {
  property: PropertyPage;
  stayId: string;
  onStayChange: (id: string) => void;
}) {
  const [values, setValues] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState<ReservationReceipt | null>(null);
  const [opened, setOpened] = useState(false);
  // O mesmo código é usado ao corrigir o pedido, para não gerar registros repetidos.
  const requestId = useRef<string | null>(null);

  const available = property.stays.filter((s) => s.availability !== "unavailable");
  const stay = property.stays.find((s) => s.id === stayId);
  const set = (field: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: e.target.value }));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    requestId.current ??= crypto.randomUUID();
    const parsed = reservationSchema.safeParse({
      ...values,
      id: requestId.current,
      property_slug: property.slug,
      stay_id: stayId,
      consent,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => (next[String(issue.path[0])] ??= issue.message));
      setErrors(next);
      return;
    }
    setErrors({});
    setFormError("");
    setSending(true);
    try {
      const result = await submitReservation({ data: parsed.data });
      if (result.ok) {
        setReceipt(result);
      } else if (result.field === "form") {
        setFormError(result.message);
      } else {
        setErrors({ [result.field]: result.message });
      }
    } catch {
      setFormError("Não foi possível registrar o pedido. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  function startOver() {
    requestId.current = null;
    setReceipt(null);
    setOpened(false);
    setValues(EMPTY);
    setConsent(false);
    onStayChange("");
  }

  if (receipt && opened) {
    return (
      <div role="status" className="mt-6 rounded-xl bg-secondary p-5">
        <p className="font-semibold text-primary">O WhatsApp foi aberto com a sua mensagem.</p>
        <p className="mt-2 text-muted-foreground">
          Confira se a mensagem foi enviada por lá. Sua reserva ainda não está confirmada:{" "}
          {property.name} vai responder sobre a disponibilidade e os valores.
        </p>
        <Button variant="outline" className="mt-4" onClick={startOver}>
          Fazer outro pedido
        </Button>
      </div>
    );
  }

  if (receipt) {
    const noNumber = !property.has_whatsapp;
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-primary">Confira o resumo</h3>
        <dl className="mt-3 grid gap-x-6 gap-y-2 rounded-xl bg-secondary p-5 sm:grid-cols-2">
          <Summary label="Modalidade" value={receipt.stay_name} />
          <Summary label="Pessoas" value={values.guests} />
          <Summary label="Entrada" value={formatDate(values.check_in)} />
          <Summary label="Saída" value={formatDate(values.check_out)} />
          <Summary label="Nome" value={values.name} />
          <Summary label="Telefone" value={values.phone} />
          {values.email && <Summary label="E-mail" value={values.email} />}
          {values.notes && <Summary label="Observações" value={values.notes} />}
        </dl>
        <p className="mt-4 text-sm text-muted-foreground">
          Este é um pedido, não uma reserva confirmada. A confirmação é feita pelo estabelecimento.
        </p>
        {noNumber && (
          <p role="note" className="mt-2 text-sm text-muted-foreground">
            Demonstração: não há número cadastrado, então o WhatsApp pedirá para você escolher um
            contato. Nada é enviado sem a sua confirmação.
          </p>
        )}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <a
            href={receipt.whatsapp_url}
            target="_blank"
            rel="noopener noreferrer"
            data-track={`enviar-whatsapp-${property.slug}`}
            onClick={() => {
              setOpened(true);
              if (requestId.current)
                void markReservationOpened({ data: { id: requestId.current } }).catch(
                  () => undefined,
                );
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <MessageCircle aria-hidden="true" className="h-5 w-5" />
            Enviar pelo WhatsApp
          </a>
          <Button
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={() => setReceipt(null)}
          >
            Corrigir dados
          </Button>
        </div>
      </div>
    );
  }

  const field = (id: string) =>
    errors[id] ? { "aria-invalid": true, "aria-describedby": `${id}-err` } : {};
  const err = (id: string) =>
    errors[id] ? (
      <p id={`${id}-err`} className="text-sm text-destructive">
        {errors[id]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="stay_id">Modalidade *</Label>
        <select
          id="stay_id"
          value={stay && stay.availability !== "unavailable" ? stayId : ""}
          onChange={(e) => onStayChange(e.target.value)}
          className="h-11 rounded-md border border-input bg-background px-3 text-base"
          {...field("stay_id")}
        >
          <option value="">Escolha uma opção</option>
          {available.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {err("stay_id")}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="check_in">Entrada *</Label>
          <Input
            id="check_in"
            type="date"
            min={today()}
            value={values.check_in}
            onChange={set("check_in")}
            {...field("check_in")}
          />
          {err("check_in")}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="check_out">Saída *</Label>
          <Input
            id="check_out"
            type="date"
            min={values.check_in || today()}
            value={values.check_out}
            onChange={set("check_out")}
            {...field("check_out")}
          />
          {err("check_out")}
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="guests">Quantidade de pessoas *</Label>
        <Input
          id="guests"
          type="number"
          inputMode="numeric"
          min={1}
          max={stay?.capacity ?? 500}
          value={values.guests}
          onChange={set("guests")}
          {...field("guests")}
        />
        {err("guests")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="res-name">Seu nome *</Label>
          <Input
            id="res-name"
            autoComplete="name"
            maxLength={100}
            value={values.name}
            onChange={set("name")}
            {...field("name")}
          />
          {errors["name"] && (
            <p id="name-err" className="text-sm text-destructive">
              {errors["name"]}
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="res-phone">Telefone com DDD *</Label>
          <Input
            id="res-phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            value={values.phone}
            onChange={set("phone")}
            {...field("phone")}
          />
          {errors["phone"] && (
            <p id="phone-err" className="text-sm text-destructive">
              {errors["phone"]}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="res-email">E-mail (opcional)</Label>
        <Input
          id="res-email"
          type="email"
          autoComplete="email"
          maxLength={255}
          value={values.email}
          onChange={set("email")}
          {...field("email")}
        />
        {errors["email"] && (
          <p id="email-err" className="text-sm text-destructive">
            {errors["email"]}
          </p>
        )}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="res-notes">Observações (opcional)</Label>
        <Textarea
          id="res-notes"
          rows={3}
          maxLength={1000}
          value={values.notes}
          onChange={set("notes")}
          {...field("notes")}
        />
        {errors["notes"] && (
          <p id="notes-err" className="text-sm text-destructive">
            {errors["notes"]}
          </p>
        )}
      </div>
      <div className="flex items-start gap-2">
        <input
          id="res-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 accent-primary"
          {...field("consent")}
        />
        <Label htmlFor="res-consent" className="font-normal leading-snug text-muted-foreground">
          Autorizo o uso destes dados para responder ao meu pedido, conforme a{" "}
          <Link to="/privacidade" className="text-primary underline">
            Política de Privacidade
          </Link>
          .
        </Label>
      </div>
      {err("consent")}
      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      )}
      <Button type="submit" size="lg" disabled={sending} className="w-full rounded-full sm:w-auto">
        {sending ? "Preparando..." : "Ver resumo do pedido"}
      </Button>
    </form>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-line break-words font-medium text-primary">{value}</dd>
    </div>
  );
}

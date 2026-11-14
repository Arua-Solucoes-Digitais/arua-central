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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createProperty,
  deleteStay,
  getPropertyAdmin,
  listProperties,
  saveStay,
  setReservationStatus,
  updateProperty,
} from "@/lib/api";
import {
  propertySchema,
  staySchema,
  type PropertyPage,
  type PropertySummary,
  type ReservationRequest,
  type ReservationStatus,
  type Stay,
} from "@/lib/schemas";
import { formatDate, formatPrice } from "@/lib/whatsapp";
import { MediaManager } from "./MediaManager";
import {
  SelectField,
  selectClass,
  StatusBadge,
  STATUS_OPTIONS,
  TextAreaField,
  TextField,
  zodErrors,
} from "./fields";

const AVAILABILITY_OPTIONS: [string, string][] = [
  ["available", "Disponível"],
  ["on_request", "Sob consulta"],
  ["unavailable", "Indisponível"],
];
const REQUEST_STATUS: [ReservationStatus, string][] = [
  ["new", "Novo"],
  ["contacted", "Em contato"],
  ["confirmed", "Confirmado"],
  ["declined", "Recusado"],
];

export function PropertiesEditor() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [selected, setSelected] = useState<string | "new" | null>(null);

  const load = useCallback(async () => {
    try {
      setProperties(await listProperties());
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  if (selected === "new") {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-2xl font-bold text-primary">Novo estabelecimento</h2>
        <IdentityForm
          property={null}
          onCancel={() => setSelected(null)}
          onSaved={async (id) => {
            await load();
            setSelected(id);
          }}
        />
      </section>
    );
  }
  if (selected) {
    return (
      <PropertyDetail
        key={selected}
        id={selected}
        onBack={() => {
          setSelected(null);
          void load();
        }}
      />
    );
  }

  return (
    <section
      aria-labelledby="properties-title"
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="properties-title" className="text-2xl font-bold text-primary">
            Aruá Hospedagens
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Cada estabelecimento tem a própria vitrine, com fotos, modalidades e pedidos separados
            dos demais.
          </p>
        </div>
        <Button onClick={() => setSelected("new")}>Adicionar estabelecimento</Button>
      </div>
      <div className="mt-6">
        {state === "loading" && <p>Carregando...</p>}
        {state === "error" && (
          <div role="alert">
            <p className="text-destructive">Não foi possível carregar os estabelecimentos.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        )}
        {state === "ready" && properties.length === 0 && (
          <p className="text-muted-foreground">Nenhum estabelecimento cadastrado.</p>
        )}
        {state === "ready" && properties.length > 0 && (
          <ul className="divide-y divide-border">
            {properties.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-semibold text-primary">
                    {p.name} <StatusBadge status={p.status} />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {p.new_requests === 1 ? "1 pedido novo" : `${p.new_requests} pedidos novos`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/hospedagens/${p.slug}`} target="_blank" rel="noopener noreferrer">
                      {p.status === "published" ? "Abrir vitrine" : "Pré-visualizar"}
                      <ExternalLink aria-hidden="true" />
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    aria-label={`Gerenciar ${p.name}`}
                    onClick={() => setSelected(p.id)}
                  >
                    Gerenciar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function PropertyDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [property, setProperty] = useState<PropertyPage | null>(null);
  const [requests, setRequests] = useState<ReservationRequest[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await getPropertyAdmin({ data: { id } });
      setProperty(data.property);
      setRequests(data.reservations);
      setState(data.property ? "ready" : "error");
    } catch {
      setState("error");
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);

  const back = (
    <Button variant="outline" size="sm" onClick={onBack}>
      Voltar à lista
    </Button>
  );
  if (state === "loading") return <p>Carregando...</p>;
  if (state === "error" || !property) {
    return (
      <div role="alert" className="space-y-3">
        <p className="text-destructive">Não foi possível carregar este estabelecimento.</p>
        {back}
      </div>
    );
  }

  return (
    <section
      aria-labelledby="property-title"
      className="rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 id="property-title" className="text-2xl font-bold text-primary">
          {property.name} <StatusBadge status={property.status} />
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/hospedagens/${property.slug}`} target="_blank" rel="noopener noreferrer">
              {property.status === "published" ? "Abrir vitrine" : "Pré-visualizar"}
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
          {back}
        </div>
      </div>
      {notice && (
        <p role="status" className="mt-3 text-sm font-medium text-primary">
          {notice}
        </p>
      )}
      <Tabs defaultValue="identidade" className="mt-5">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="identidade">Identidade</TabsTrigger>
          <TabsTrigger value="modalidades">Modalidades</TabsTrigger>
          <TabsTrigger value="midia">Fotos e vídeos</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos ({requests.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="identidade" className="mt-5">
          <IdentityForm
            key={property.status + property.slug}
            property={property}
            onSaved={async () => {
              await load();
              setNotice("Dados salvos.");
            }}
          />
        </TabsContent>
        <TabsContent value="modalidades" className="mt-5">
          <StaysEditor property={property} onChange={load} />
        </TabsContent>
        <TabsContent value="midia" className="mt-5 grid gap-4">
          <MediaManager
            title="Logotipo"
            hint="JPG, PNG ou WebP, até 8 MB. Um novo logotipo substitui o atual."
            target="property"
            targetId={property.id}
            role="logo"
            single
            items={property.logo ? [property.logo] : []}
            onChange={load}
          />
          <MediaManager
            title="Banner"
            hint="Imagem de fundo do topo da vitrine. A primeira da lista é a usada."
            target="property"
            targetId={property.id}
            role="banner"
            items={property.banners}
            onChange={load}
          />
          <MediaManager
            title="Galeria: ambientes e vídeos"
            hint="Imagens até 8 MB; vídeos MP4 ou WebM até 64 MB. A ordem aqui é a ordem da vitrine."
            target="property"
            targetId={property.id}
            role="gallery"
            allowVideo
            items={property.gallery}
            onChange={load}
          />
        </TabsContent>
        <TabsContent value="pedidos" className="mt-5">
          <RequestsList propertyId={property.id} requests={requests} onChange={load} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function IdentityForm({
  property,
  onSaved,
  onCancel,
}: {
  property: PropertyPage | null;
  onSaved: (id: string) => Promise<void>;
  onCancel?: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = propertySchema.safeParse({
      ...Object.fromEntries(fd),
      is_demo: fd.get("is_demo") === "on",
    });
    if (!parsed.success) return setErrors(zodErrors(parsed.error.issues));
    setErrors({});
    setFormError("");
    setSaving(true);
    try {
      if (property) {
        const result = await updateProperty({ data: { ...parsed.data, id: property.id } });
        if (!result.ok)
          return result.field === "form"
            ? setFormError(result.message)
            : setErrors({ [result.field]: result.message });
        await onSaved(property.id);
      } else {
        const result = await createProperty({ data: parsed.data });
        if (!result.ok)
          return result.field === "form"
            ? setFormError(result.message)
            : setErrors({ [result.field]: result.message });
        await onSaved(result.id);
      }
    } catch {
      setFormError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const common = { prefix: "property", errors };
  return (
    <form onSubmit={onSubmit} noValidate className="mt-4 grid gap-4">
      <TextField
        {...common}
        name="name"
        label="Nome do estabelecimento *"
        value={property?.name ?? ""}
        maxLength={120}
      />
      <TextField
        {...common}
        name="slug"
        label="Endereço da vitrine"
        value={property?.slug ?? ""}
        maxLength={80}
        hint="Em branco, é criado a partir do nome. Fica em /hospedagens/este-endereco."
      />
      <TextAreaField
        {...common}
        name="description"
        label="Descrição"
        value={property?.description ?? ""}
        maxLength={3000}
        rows={5}
      />
      <TextAreaField
        {...common}
        name="amenities"
        label="Comodidades"
        value={property?.amenities ?? ""}
        maxLength={2000}
        rows={4}
        hint="Uma por linha, como Piscina ou Wi-Fi."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          {...common}
          name="whatsapp"
          label="WhatsApp de atendimento"
          type="tel"
          inputMode="tel"
          value={property?.whatsapp ?? ""}
          maxLength={25}
          hint="Com DDI e DDD, como 55 11 91234-5678. Obrigatório para publicar um estabelecimento real."
        />
        <TextField
          {...common}
          name="instagram"
          label="Instagram"
          value={property?.instagram ?? ""}
          maxLength={100}
          placeholder="@estabelecimento"
        />
      </div>
      <TextField
        {...common}
        name="address"
        label="Endereço"
        value={property?.address ?? ""}
        maxLength={300}
      />
      <TextField
        {...common}
        name="maps_url"
        label="Link do Google Maps"
        value={property?.maps_url ?? ""}
        maxLength={500}
        placeholder="https://"
      />
      <SelectField
        {...common}
        name="status"
        label="Situação"
        value={property?.status ?? "draft"}
        options={STATUS_OPTIONS}
      />
      <div className="flex items-start gap-2">
        <input
          id="property-is_demo"
          name="is_demo"
          type="checkbox"
          defaultChecked={property?.is_demo ?? false}
          className="mt-1 h-4 w-4 accent-primary"
        />
        <Label htmlFor="property-is_demo" className="font-normal leading-snug">
          Este estabelecimento é uma demonstração (mostra o aviso na vitrine e fica fora dos
          buscadores)
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
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

function StaysEditor({
  property,
  onChange,
}: {
  property: PropertyPage;
  onChange: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState("");
  const current = property.stays.find((s) => s.id === editing) ?? null;

  async function remove(stay: Stay) {
    setError("");
    try {
      await deleteStay({ data: { property_id: property.id, id: stay.id } });
      await onChange();
    } catch {
      setError("Não foi possível excluir. Tente novamente.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Quarto, day use, fim de semana, espaço inteiro ou o que o estabelecimento oferecer.
        </p>
        {editing === null && (
          <Button size="sm" onClick={() => setEditing("new")}>
            Adicionar modalidade
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {editing !== null && (
        <StayForm
          key={editing}
          propertyId={property.id}
          stay={current}
          onCancel={() => setEditing(null)}
          onReload={onChange}
          onSaved={async () => {
            setEditing(null);
            await onChange();
          }}
        />
      )}
      {property.stays.length === 0 && editing === null && (
        <p className="mt-4 text-muted-foreground">Nenhuma modalidade cadastrada.</p>
      )}
      <ul className="mt-4 divide-y divide-border">
        {property.stays.map((s) => (
          <li key={s.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
            <div className="min-w-0 flex-1 basis-56">
              <p className="font-semibold text-primary">{s.name}</p>
              <p className="text-sm text-muted-foreground">
                {s.price_cents === null
                  ? "Sob consulta"
                  : `${formatPrice(s.price_cents)} ${s.billing}`}
                {s.capacity !== null && ` · até ${s.capacity} pessoas`}
                {" · "}
                {AVAILABILITY_OPTIONS.find(([value]) => value === s.availability)?.[1]}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                aria-label={`Editar ${s.name}`}
                onClick={() => setEditing(s.id)}
              >
                <Pencil aria-hidden="true" /> Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" aria-label={`Excluir ${s.name}`}>
                    <Trash2 aria-hidden="true" /> Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir "{s.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      A modalidade e as fotos dela saem da vitrine. Os pedidos já recebidos
                      continuam guardados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => void remove(s)}>Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StayForm({
  propertyId,
  stay,
  onCancel,
  onSaved,
  onReload,
}: {
  propertyId: string;
  stay: Stay | null;
  onCancel: () => void;
  onSaved: () => Promise<void>;
  onReload: () => Promise<void>;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = staySchema.safeParse({
      ...Object.fromEntries(fd),
      allows_same_day: fd.get("allows_same_day") === "on",
    });
    if (!parsed.success) return setErrors(zodErrors(parsed.error.issues));
    setErrors({});
    setFormError("");
    setSaving(true);
    try {
      const result = await saveStay({
        data: { ...parsed.data, property_id: propertyId, id: stay?.id ?? null },
      });
      if (!result.ok)
        return result.field === "form"
          ? setFormError(result.message)
          : setErrors({ [result.field]: result.message });
      await onSaved();
    } catch {
      setFormError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const common = { prefix: "stay", errors };
  const price =
    stay?.price_cents == null ? "" : (stay.price_cents / 100).toFixed(2).replace(".", ",");
  return (
    <div className="mt-4 grid gap-4 rounded-xl border border-border bg-secondary p-5">
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <h3 className="text-lg font-semibold text-primary">
          {stay ? "Editar modalidade" : "Nova modalidade"}
        </h3>
        <TextField {...common} name="name" label="Nome *" value={stay?.name ?? ""} maxLength={80} />
        <TextAreaField
          {...common}
          name="description"
          label="Descrição"
          value={stay?.description ?? ""}
          maxLength={1000}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            {...common}
            name="price"
            label="Preço (R$)"
            inputMode="numeric"
            value={price}
            hint="Em branco: sob consulta."
          />
          <TextField
            {...common}
            name="billing"
            label="Forma de cobrança"
            value={stay?.billing ?? ""}
            maxLength={60}
            placeholder="por noite"
          />
          <TextField
            {...common}
            name="capacity"
            label="Capacidade de pessoas"
            inputMode="numeric"
            value={stay?.capacity ?? ""}
          />
        </div>
        <TextAreaField
          {...common}
          name="rules"
          label="Regras"
          value={stay?.rules ?? ""}
          maxLength={1000}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            {...common}
            name="check_in_time"
            label="Horário de entrada"
            type="time"
            value={stay?.check_in_time ?? ""}
          />
          <TextField
            {...common}
            name="check_out_time"
            label="Horário de saída"
            type="time"
            value={stay?.check_out_time ?? ""}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            {...common}
            name="availability"
            label="Disponibilidade"
            value={stay?.availability ?? "available"}
            options={AVAILABILITY_OPTIONS}
          />
          <TextField
            {...common}
            name="availability_note"
            label="Observação sobre disponibilidade"
            value={stay?.availability_note ?? ""}
            maxLength={200}
          />
        </div>
        <TextField
          {...common}
          name="sort_order"
          label="Ordem"
          type="number"
          value={stay?.sort_order ?? 0}
        />
        <div className="flex items-start gap-2">
          <input
            id="stay-allows_same_day"
            name="allows_same_day"
            type="checkbox"
            defaultChecked={stay?.allows_same_day ?? false}
            className="mt-1 h-4 w-4 accent-primary"
          />
          <Label htmlFor="stay-allows_same_day" className="font-normal leading-snug">
            Entrada e saída podem ser no mesmo dia (como no day use)
          </Label>
        </div>
        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar modalidade"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
      {stay ? (
        <MediaManager
          title="Fotos desta modalidade"
          hint="JPG, PNG ou WebP, até 8 MB. A primeira aparece na vitrine."
          target="property"
          targetId={propertyId}
          stayId={stay.id}
          role="stay"
          items={stay.photos}
          onChange={onReload}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Depois de salvar, use "Editar" para enviar as fotos.
        </p>
      )}
    </div>
  );
}

function RequestsList({
  propertyId,
  requests,
  onChange,
}: {
  propertyId: string;
  requests: ReservationRequest[];
  onChange: () => Promise<void>;
}) {
  const [error, setError] = useState("");
  async function changeStatus(id: string, status: ReservationStatus) {
    setError("");
    try {
      await setReservationStatus({ data: { property_id: propertyId, id, status } });
      await onChange();
    } catch {
      setError("Não foi possível alterar o pedido. Tente novamente.");
    }
  }
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        A situação serve só para o seu controle: mudar aqui não avisa o cliente. Confirme com ele
        pelo WhatsApp.
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {requests.length === 0 && <p className="mt-4 text-muted-foreground">Nenhum pedido ainda.</p>}
      <ul className="mt-4 space-y-4">
        {requests.map((r) => (
          <li key={r.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-primary">
                {r.name} · {r.stay_name}
              </p>
              <time className="text-sm text-muted-foreground">
                {new Date(r.created_at).toLocaleString("pt-BR")}
              </time>
            </div>
            <p className="mt-1 text-sm">
              {formatDate(r.check_in)} a {formatDate(r.check_out)} · {r.guests}{" "}
              {r.guests === 1 ? "pessoa" : "pessoas"}
            </p>
            <p className="text-sm">
              {r.phone}
              {r.email ? ` · ${r.email}` : ""}
            </p>
            {r.notes && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{r.notes}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {r.whatsapp_opened_at
                ? "O cliente abriu o WhatsApp; não é possível saber se a mensagem foi enviada."
                : "O cliente viu o resumo, mas não abriu o WhatsApp."}
            </p>
            <div className="mt-3 max-w-48">
              <Label htmlFor={`status-${r.id}`} className="text-xs">
                Situação do pedido
              </Label>
              <select
                id={`status-${r.id}`}
                value={r.status}
                onChange={(e) => void changeStatus(r.id, e.target.value as ReservationStatus)}
                className={`${selectClass} mt-1`}
              >
                {REQUEST_STATUS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

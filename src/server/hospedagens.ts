// Aruá Hospedagens. Toda consulta parte do estabelecimento, para os dados de um cliente não chegarem a outro.
import { randomUUID } from "node:crypto";
import type {
  ActionResult,
  MediaItem,
  Property,
  PropertyInput,
  PropertyPage,
  PropertySummary,
  ReservationInput,
  ReservationReceipt,
  ReservationRequest,
  ReservationStatus,
  Stay,
  StayInput,
} from "../lib/schemas.ts";
import { slugify } from "../lib/slug.ts";
import { buildReservationMessage, buildWhatsappUrl } from "../lib/whatsapp.ts";
import { all, get, run, transaction } from "./db.ts";
import { listMedia, listMediaFiles, removeFiles } from "./media.ts";

type PropertyRow = Omit<Property, "is_demo"> & { is_demo: number };
type StayRow = Omit<Stay, "allows_same_day" | "photos"> & {
  allows_same_day: number;
  property_id: string;
};

const toProperty = ({ is_demo, ...row }: PropertyRow): Property => ({
  ...row,
  is_demo: is_demo === 1,
});

function audit(actorId: string, action: string, targetId: string, before: unknown, after: unknown) {
  run(
    "insert into admin_audit_log (actor_id, action, target_id, before_data, after_data) values (?, ?, ?, ?, ?)",
    actorId,
    action,
    targetId,
    before === null ? null : JSON.stringify(before),
    after === null ? null : JSON.stringify(after),
  );
}

function fail(field: string, message: string): ActionResult<never> {
  return { ok: false, field, message };
}

function stays(propertyId: string, photos: MediaItem[]): Stay[] {
  return all<StayRow>(
    "select * from stay_types where property_id = ? order by sort_order, created_at",
    propertyId,
  ).map(({ allows_same_day, property_id: _owner, ...row }) => ({
    ...row,
    allows_same_day: allows_same_day === 1,
    photos: photos.filter((p) => p.stay_id === row.id),
  }));
}

function buildPage(property: Property): PropertyPage {
  const media = listMedia("where property_id = ?", property.id);
  return {
    ...property,
    has_whatsapp: property.whatsapp !== "",
    logo: media.find((m) => m.role === "logo") ?? null,
    banners: media.filter((m) => m.role === "banner"),
    gallery: media.filter((m) => m.role === "gallery"),
    stays: stays(property.id, media),
  };
}

// Vitrine pública: rascunhos e arquivados só aparecem para quem está conectado ao painel.
export function getPropertyPage(slug: string, isAdmin: boolean): PropertyPage | null {
  const row = get<PropertyRow>("select * from properties where slug = ?", slug);
  if (!row || (row.status !== "published" && !isAdmin)) return null;
  const page = buildPage(toProperty(row));
  // O número só sai nesta resposta para o painel; o visitante recebe o link pronto no fim do pedido.
  return isAdmin ? page : { ...page, whatsapp: "" };
}

export function listProperties(): PropertySummary[] {
  return all<Omit<PropertySummary, "is_demo"> & { is_demo: number }>(
    `select properties.id, slug, name, properties.status, is_demo,
       (select count(*) from reservation_requests r where r.property_id = properties.id and r.status = 'new') as new_requests
     from properties order by is_demo, name collate nocase`,
  ).map((row) => ({ ...row, is_demo: row.is_demo === 1 }));
}

export function getPropertyForAdmin(id: string): PropertyPage | null {
  const row = get<PropertyRow>("select * from properties where id = ?", id);
  return row ? buildPage(toProperty(row)) : null;
}

function validateProperty(
  input: PropertyInput,
  slug: string,
  ignoreId: string,
): ActionResult | null {
  if (!slug) return fail("slug", "Informe um endereço para a vitrine.");
  if (get("select id from properties where slug = ? and id <> ?", slug, ignoreId)) {
    return fail("slug", "Já existe um estabelecimento com este endereço.");
  }
  if (input.status === "published" && !input.is_demo && !input.whatsapp) {
    return fail("whatsapp", "Informe o WhatsApp antes de publicar: é para ele que os pedidos vão.");
  }
  return null;
}

export function createProperty(
  actorId: string,
  input: PropertyInput,
): ActionResult<{ id: string }> {
  const slug = input.slug || slugify(input.name);
  return transaction(() => {
    const error = validateProperty(input, slug, "");
    if (error) return error as ActionResult<{ id: string }>;
    const id = randomUUID();
    run(
      `insert into properties (id, slug, name, description, amenities, instagram, address, maps_url, whatsapp, status, is_demo)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      slug,
      input.name,
      input.description,
      input.amenities,
      input.instagram,
      input.address,
      input.maps_url,
      input.whatsapp,
      input.status,
      input.is_demo ? 1 : 0,
    );
    audit(actorId, "property.create", id, null, { ...input, slug });
    return { ok: true, id };
  });
}

export function updateProperty(actorId: string, id: string, input: PropertyInput): ActionResult {
  const slug = input.slug || slugify(input.name);
  return transaction(() => {
    const before = get<PropertyRow>("select * from properties where id = ?", id);
    if (!before) return fail("form", "Estabelecimento não encontrado.");
    const error = validateProperty(input, slug, id);
    if (error) return error;
    run(
      `update properties set slug = ?, name = ?, description = ?, amenities = ?, instagram = ?, address = ?,
         maps_url = ?, whatsapp = ?, status = ?, is_demo = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       where id = ?`,
      slug,
      input.name,
      input.description,
      input.amenities,
      input.instagram,
      input.address,
      input.maps_url,
      input.whatsapp,
      input.status,
      input.is_demo ? 1 : 0,
      id,
    );
    audit(actorId, "property.update", id, before, { ...input, slug });
    return { ok: true };
  });
}

const priceToCents = (price: string) =>
  price === "" ? null : Math.round(Number(price.replace(",", ".")) * 100);

export function saveStay(
  actorId: string,
  propertyId: string,
  stayId: string | null,
  input: StayInput,
): ActionResult<{ id: string }> {
  return transaction(() => {
    if (!get("select id from properties where id = ?", propertyId)) {
      return fail("form", "Estabelecimento não encontrado.");
    }
    const duplicate = all<{ id: string; name: string }>(
      "select id, name from stay_types where property_id = ?",
      propertyId,
    ).find((s) => s.id !== stayId && slugify(s.name) === slugify(input.name));
    if (duplicate) return fail("name", "Este estabelecimento já tem uma modalidade com este nome.");

    const values = [
      input.name,
      input.description,
      input.capacity === "" ? null : Number(input.capacity),
      priceToCents(input.price),
      input.billing,
      input.rules,
      input.check_in_time,
      input.check_out_time,
      input.availability,
      input.availability_note,
      input.allows_same_day ? 1 : 0,
      input.sort_order,
    ];
    if (stayId) {
      // A condição com property_id impede alterar a modalidade de outro estabelecimento.
      const before = get(
        "select * from stay_types where id = ? and property_id = ?",
        stayId,
        propertyId,
      );
      if (!before) return fail("form", "Modalidade não encontrada neste estabelecimento.");
      run(
        `update stay_types set name = ?, description = ?, capacity = ?, price_cents = ?, billing = ?, rules = ?,
           check_in_time = ?, check_out_time = ?, availability = ?, availability_note = ?, allows_same_day = ?,
           sort_order = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
         where id = ? and property_id = ?`,
        ...values,
        stayId,
        propertyId,
      );
      audit(actorId, "stay.update", stayId, before, input);
      return { ok: true, id: stayId };
    }
    const id = randomUUID();
    run(
      `insert into stay_types (name, description, capacity, price_cents, billing, rules, check_in_time, check_out_time,
         availability, availability_note, allows_same_day, sort_order, id, property_id)
       values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ...values,
      id,
      propertyId,
    );
    audit(actorId, "stay.create", id, null, input);
    return { ok: true, id };
  });
}

export function deleteStay(actorId: string, propertyId: string, stayId: string) {
  let files: string[] = [];
  transaction(() => {
    const before = get(
      "select * from stay_types where id = ? and property_id = ?",
      stayId,
      propertyId,
    );
    if (!before) throw new Error("Modalidade não encontrada neste estabelecimento");
    files = listMediaFiles("where stay_id = ? and property_id = ?", stayId, propertyId);
    run("delete from stay_types where id = ? and property_id = ?", stayId, propertyId);
    audit(actorId, "stay.delete", stayId, before, null);
  });
  removeFiles(files);
}

// A data é a do Brasil, para um pedido feito à noite não ser recusado como "data passada".
export function todayInBrazil(now = new Date()) {
  return now.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

function isRealDate(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function createReservation(
  input: ReservationInput,
  today = todayInBrazil(),
): ActionResult<ReservationReceipt> {
  return transaction(() => {
    const property = get<PropertyRow>(
      "select * from properties where slug = ? and status = 'published'",
      input.property_slug,
    );
    if (!property) return fail("form", "Este estabelecimento não está recebendo pedidos.");
    // A modalidade precisa ser deste estabelecimento: não basta existir em outro.
    const stay = get<StayRow>(
      "select * from stay_types where id = ? and property_id = ?",
      input.stay_id,
      property.id,
    );
    if (!stay) return fail("stay_id", "Escolha uma modalidade deste estabelecimento.");
    if (stay.availability === "unavailable") {
      return fail("stay_id", "Esta modalidade está indisponível no momento.");
    }
    if (!isRealDate(input.check_in)) return fail("check_in", "Escolha uma data válida.");
    if (!isRealDate(input.check_out)) return fail("check_out", "Escolha uma data válida.");
    if (input.check_in < today)
      return fail("check_in", "A entrada não pode ser em uma data passada.");
    if (input.check_out < input.check_in) {
      return fail("check_out", "A saída não pode ser antes da entrada.");
    }
    if (input.check_out === input.check_in && stay.allows_same_day !== 1) {
      return fail("check_out", "Nesta modalidade, a saída precisa ser depois da entrada.");
    }
    if (stay.capacity !== null && input.guests > stay.capacity) {
      return fail("guests", `Esta modalidade recebe até ${stay.capacity} pessoas.`);
    }

    const owner = get<{ property_id: string; whatsapp_opened_at: string | null }>(
      "select property_id, whatsapp_opened_at from reservation_requests where id = ?",
      input.id,
    );
    // Depois de aberto no WhatsApp, o pedido é um registro fechado; uma correção vira um novo pedido.
    if (owner && (owner.property_id !== property.id || owner.whatsapp_opened_at)) {
      return fail("form", "Este pedido já foi enviado. Faça um novo pedido.");
    }
    const values = [
      stay.id,
      stay.name,
      input.check_in,
      input.check_out,
      input.guests,
      input.name,
      input.phone,
      input.email || null,
      input.notes,
    ];
    // Corrigir o pedido antes de enviar atualiza o mesmo registro, em vez de criar outro.
    if (owner) {
      run(
        `update reservation_requests set stay_id = ?, stay_name = ?, check_in = ?, check_out = ?, guests = ?, name = ?,
           phone = ?, email = ?, notes = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
         where id = ?`,
        ...values,
        input.id,
      );
    } else {
      run(
        `insert into reservation_requests
           (stay_id, stay_name, check_in, check_out, guests, name, phone, email, notes, consent, id, property_id)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        ...values,
        input.id,
        property.id,
      );
    }
    const message = buildReservationMessage({
      propertyName: property.name,
      isDemo: property.is_demo === 1,
      stayName: stay.name,
      checkIn: input.check_in,
      checkOut: input.check_out,
      guests: input.guests,
      name: input.name,
      phone: input.phone,
      email: input.email,
      notes: input.notes,
    });
    return {
      ok: true,
      message,
      stay_name: stay.name,
      whatsapp_url: buildWhatsappUrl(property.whatsapp, message),
    };
  });
}

export function markReservationOpened(id: string) {
  run(
    "update reservation_requests set whatsapp_opened_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') where id = ? and whatsapp_opened_at is null",
    id,
  );
}

export function listReservations(propertyId: string): ReservationRequest[] {
  return all<ReservationRequest>(
    `select id, stay_name, check_in, check_out, guests, name, phone, email, notes, status, whatsapp_opened_at, created_at
     from reservation_requests where property_id = ? order by created_at desc`,
    propertyId,
  );
}

export function setReservationStatus(
  actorId: string,
  propertyId: string,
  id: string,
  status: ReservationStatus,
) {
  transaction(() => {
    const before = get<{ status: string }>(
      "select status from reservation_requests where id = ? and property_id = ?",
      id,
      propertyId,
    );
    if (!before) throw new Error("Pedido não encontrado neste estabelecimento");
    run(
      "update reservation_requests set status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') where id = ? and property_id = ?",
      status,
      id,
      propertyId,
    );
    audit(actorId, "reservation.status", id, before, { status });
  });
}

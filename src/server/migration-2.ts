// Migração 2: status de publicação nos projetos e o produto Aruá Hospedagens.
// Os projetos que já existem são preservados. Os dados inseridos aqui são de demonstração.
import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { slugify } from "../lib/slug.ts";

const NOW = `(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;

function uniqueKey(base: string, used: Set<string>) {
  const start = base || "projeto";
  let key = start;
  for (let n = 2; used.has(key); n++) key = `${start}-${n}`;
  used.add(key);
  return key;
}

export function migration2(db: DatabaseSync) {
  db.exec(`
  alter table base_projects rename to base_projects_v1;
  create table base_projects (
    id text primary key,
    slug text not null unique check (slug glob '[a-z0-9]*' and slug not glob '*[^a-z0-9-]*' and length(slug) <= 80),
    title text not null check (length(title) between 1 and 80),
    title_key text not null unique,
    description text not null check (length(description) between 1 and 300),
    problem text not null default '' check (length(problem) <= 800),
    features text not null default '' check (length(features) <= 2000),
    demo_url text check (
      demo_url is null or (
        length(demo_url) <= 500
        and demo_url not glob '*[' || char(9, 10, 13, 32) || ']*'
        and (demo_url like 'https://_%' or (demo_url like '/_%' and demo_url not like '//%'))
      )
    ),
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    sort_order integer not null default 0 check (sort_order between 0 and 9999),
    published_at text,
    created_at text not null default ${NOW},
    updated_at text not null default ${NOW}
  );
  create unique index base_projects_demo_url on base_projects(demo_url) where demo_url is not null;

  create table properties (
    id text primary key,
    slug text not null unique check (slug glob '[a-z0-9]*' and slug not glob '*[^a-z0-9-]*' and length(slug) <= 80),
    name text not null check (length(name) between 1 and 120),
    description text not null default '' check (length(description) <= 3000),
    amenities text not null default '' check (length(amenities) <= 2000),
    instagram text not null default '' check (length(instagram) <= 100),
    address text not null default '' check (length(address) <= 300),
    maps_url text not null default '' check (maps_url = '' or (maps_url like 'https://_%' and length(maps_url) <= 500)),
    whatsapp text not null default '' check (whatsapp = '' or (length(whatsapp) between 10 and 15 and whatsapp not glob '*[^0-9]*')),
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    is_demo integer not null default 0 check (is_demo in (0, 1)),
    created_at text not null default ${NOW},
    updated_at text not null default ${NOW},
    -- Um estabelecimento real só vai ao ar com um WhatsApp para receber as solicitações.
    check (status <> 'published' or is_demo = 1 or whatsapp <> '')
  );
  create table stay_types (
    id text primary key,
    property_id text not null references properties(id) on delete cascade,
    name text not null check (length(name) between 1 and 80),
    description text not null default '' check (length(description) <= 1000),
    capacity integer check (capacity is null or capacity between 1 and 500),
    price_cents integer check (price_cents is null or price_cents between 0 and 100000000),
    billing text not null default '' check (length(billing) <= 60),
    rules text not null default '' check (length(rules) <= 1000),
    check_in_time text not null default '' check (check_in_time = '' or check_in_time glob '[0-2][0-9]:[0-5][0-9]'),
    check_out_time text not null default '' check (check_out_time = '' or check_out_time glob '[0-2][0-9]:[0-5][0-9]'),
    availability text not null default 'available' check (availability in ('available', 'on_request', 'unavailable')),
    availability_note text not null default '' check (length(availability_note) <= 200),
    allows_same_day integer not null default 0 check (allows_same_day in (0, 1)),
    sort_order integer not null default 0 check (sort_order between 0 and 9999),
    created_at text not null default ${NOW},
    updated_at text not null default ${NOW},
    unique (id, property_id)
  );
  create index stay_types_property on stay_types(property_id, sort_order);
  create table media (
    id text primary key,
    project_id text references base_projects(id) on delete cascade,
    property_id text references properties(id) on delete cascade,
    stay_id text,
    role text not null check (role in ('cover', 'logo', 'banner', 'gallery', 'stay')),
    kind text not null check (kind in ('image', 'video')),
    mime text not null,
    size integer not null,
    file text not null,
    alt text not null default '' check (length(alt) <= 200),
    description text not null default '' check (length(description) <= 300),
    sort_order integer not null default 0,
    created_at text not null default ${NOW},
    check ((project_id is null) <> (property_id is null)),
    -- A foto de uma modalidade só pode pertencer ao mesmo estabelecimento da modalidade.
    foreign key (stay_id, property_id) references stay_types(id, property_id) on delete cascade
  );
  create index media_property on media(property_id, role, sort_order);
  create index media_project on media(project_id, role, sort_order);
  create table reservation_requests (
    id text primary key,
    property_id text not null references properties(id) on delete cascade,
    stay_id text references stay_types(id) on delete set null,
    stay_name text not null,
    check_in text not null check (check_in glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
    check_out text not null check (check_out >= check_in and check_out glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
    guests integer not null check (guests between 1 and 500),
    name text not null check (length(name) between 1 and 100),
    phone text not null check (length(phone) between 8 and 30),
    email text check (email is null or length(email) <= 255),
    notes text not null default '' check (length(notes) <= 1000),
    consent integer not null check (consent = 1),
    status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'declined')),
    whatsapp_opened_at text,
    created_at text not null default ${NOW},
    updated_at text not null default ${NOW}
  );
  create index reservation_requests_property on reservation_requests(property_id, created_at);
  `);

  const insertProject = db.prepare(
    `insert into base_projects
       (id, slug, title, title_key, description, demo_url, status, sort_order, published_at, created_at, updated_at)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const slugs = new Set<string>();
  const titles = new Set<string>();
  const urls = new Set<string>();
  const existing = db.prepare("select * from base_projects_v1 order by created_at").all() as {
    id: string;
    title: string;
    description: string;
    demo_url: string;
    is_published: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
  }[];
  for (const row of existing) {
    const published = row.is_published === 1;
    // Links repetidos não são permitidos daqui em diante; o dado antigo fica sem perder o projeto.
    const demoUrl = urls.has(row.demo_url) ? null : row.demo_url;
    if (demoUrl) urls.add(demoUrl);
    const key = slugify(row.title);
    insertProject.run(
      row.id,
      uniqueKey(key, slugs),
      row.title,
      uniqueKey(key, titles),
      row.description,
      demoUrl,
      published ? "published" : "draft",
      row.sort_order,
      published ? row.updated_at : null,
      row.created_at,
      row.updated_at,
    );
  }
  db.exec("drop table base_projects_v1");
  if (!slugs.has("arua-hospedagens") && !titles.has("arua-hospedagens")) seedHospedagens(db);
}

function seedHospedagens(db: DatabaseSync) {
  // Fica como rascunho: quem decide ir ao ar é o administrador, pelo painel.
  db.prepare(
    `insert into base_projects (id, slug, title, title_key, description, problem, features, demo_url, status, sort_order)
     values (?, 'arua-hospedagens', 'Aruá Hospedagens', 'arua-hospedagens', ?, ?, ?, '/hospedagens/demonstracao', 'draft', 0)`,
  ).run(
    randomUUID(),
    "Vitrine e pedidos de reserva para sítios, pousadas, hotéis, chalés e casas de temporada, com atendimento pelo WhatsApp.",
    "Quem tem uma hospedagem costuma responder às mesmas perguntas várias vezes e recebe pedidos de reserva incompletos, sem datas, sem quantidade de pessoas ou sem saber qual opção o hóspede quer.",
    [
      "Página própria com fotos, vídeos, comodidades e localização",
      "Modalidades como quarto, day use, fim de semana e espaço inteiro",
      "Pedido de reserva com datas, pessoas e dados de contato",
      "Mensagem organizada, pronta para enviar pelo WhatsApp",
      "Painel para editar tudo sem mexer no código",
    ].join("\n"),
  );

  const propertyId = randomUUID();
  db.prepare(
    `insert into properties (id, slug, name, description, amenities, instagram, address, status, is_demo)
     values (?, 'demonstracao', ?, ?, ?, '', ?, 'published', 1)`,
  ).run(
    propertyId,
    "Sítio Recanto do Ipê (demonstração)",
    "Este estabelecimento é fictício e existe só para mostrar como a vitrine funciona. Os textos, valores e horários são exemplos e nenhuma reserva será atendida.",
    ["Piscina", "Churrasqueira", "Wi-Fi", "Estacionamento", "Área verde", "Aceita animais"].join(
      "\n",
    ),
    "Endereço de exemplo, Cidade Fictícia (demonstração)",
  );

  const insertStay = db.prepare(
    `insert into stay_types
       (id, property_id, name, description, capacity, price_cents, billing, rules, check_in_time, check_out_time, availability, availability_note, allows_same_day, sort_order)
     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const stays: [
    string,
    string,
    number,
    number,
    string,
    string,
    string,
    string,
    string,
    string,
    number,
  ][] = [
    [
      "Quarto individual",
      "Quarto reservado, com acesso às áreas comuns.",
      2,
      25000,
      "por noite",
      "Exemplo: silêncio após as 22h.",
      "14:00",
      "12:00",
      "available",
      "",
      0,
    ],
    [
      "Day use",
      "Um dia inteiro no sítio, sem pernoite.",
      20,
      6000,
      "por pessoa",
      "Exemplo: crianças até 5 anos não pagam.",
      "09:00",
      "18:00",
      "available",
      "",
      1,
    ],
    [
      "Fim de semana",
      "Da sexta-feira ao domingo, no sítio.",
      8,
      120000,
      "por pacote",
      "Exemplo: mínimo de duas noites.",
      "16:00",
      "16:00",
      "on_request",
      "Exemplo: confirme a data com o estabelecimento.",
      0,
    ],
    [
      "Sítio inteiro",
      "Todo o espaço só para o seu grupo.",
      30,
      300000,
      "por diária",
      "Exemplo: festas somente com aviso prévio.",
      "10:00",
      "10:00",
      "on_request",
      "Exemplo: sujeito à disponibilidade.",
      0,
    ],
  ];
  stays.forEach((stay, index) => insertStay.run(randomUUID(), propertyId, ...stay, index));
}

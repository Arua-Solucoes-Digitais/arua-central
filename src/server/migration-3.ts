// Migração 3: portfólio, sistemas no ar e depoimentos.
// - Projetos ganham tipo (produto da Aruá ou trabalho para cliente), categoria, cliente e resultados.
// - "deployments" guarda onde cada sistema roda ao vivo; "deployment_checks", o histórico das verificações.
// - Depoimentos só vão ao ar com a autorização do autor registrada (regra da marca: nada inventado).
// - Mensagens de contato ganham o assunto (orçamento, reunião, suporte...).
const NOW = `(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;
const HTTPS = (column: string) =>
  `${column} like 'https://_%' and length(${column}) <= 500 and ${column} not glob '*[' || char(9, 10, 13, 32) || ']*'`;

export const migration3 = `
alter table base_projects add column kind text not null default 'product'
  check (kind in ('product', 'case'));
alter table base_projects add column category text not null default 'sistema'
  check (category in ('site', 'aplicacao', 'sistema', 'social', 'audiovisual'));
alter table base_projects add column client text not null default ''
  check (length(client) <= 120);
alter table base_projects add column results text not null default ''
  check (length(results) <= 2000);

create table deployments (
  id text primary key,
  project_id text not null references base_projects(id) on delete cascade,
  environment text not null check (environment in ('production', 'demo', 'staging')),
  url text not null check (${HTTPS("url")}),
  health_url text check (health_url is null or (${HTTPS("health_url")})),
  host text not null default '' check (length(host) <= 80),
  -- planned: ainda não está hospedado; active: no ar e verificado; maintenance: fora do ar de propósito.
  mode text not null default 'planned' check (mode in ('planned', 'active', 'maintenance')),
  is_public integer not null default 1 check (is_public in (0, 1)),
  notes text not null default '' check (length(notes) <= 500),
  last_checked_at text,
  last_ok integer check (last_ok is null or last_ok in (0, 1)),
  last_http_status integer,
  last_latency_ms integer,
  created_at text not null default ${NOW},
  updated_at text not null default ${NOW},
  unique (project_id, environment)
);
create index deployments_project on deployments(project_id);

create table deployment_checks (
  id integer primary key,
  deployment_id text not null references deployments(id) on delete cascade,
  ok integer not null check (ok in (0, 1)),
  http_status integer,
  latency_ms integer,
  error text check (error is null or length(error) <= 200),
  checked_at text not null default ${NOW}
);
create index deployment_checks_deployment on deployment_checks(deployment_id, checked_at);

create table testimonials (
  id text primary key,
  author text not null check (length(author) between 1 and 100),
  role text not null default '' check (length(role) <= 120),
  quote text not null check (length(quote) between 1 and 600),
  project_id text references base_projects(id) on delete set null,
  authorized integer not null default 0 check (authorized in (0, 1)),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  created_at text not null default ${NOW},
  updated_at text not null default ${NOW},
  -- Depoimento publicado precisa da autorização de quem falou.
  check (status <> 'published' or authorized = 1)
);

alter table contact_messages add column topic text not null default 'orcamento'
  check (topic in ('orcamento', 'teste', 'reuniao', 'suporte', 'outro'));
`;

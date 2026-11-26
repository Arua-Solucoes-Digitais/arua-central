-- Contatos do site público (aruasolucoes.com.br).
-- Ninguém lê nem grava a tabela pela API: o site só chama submit_contact(), que valida, limita e grava.
-- O responsável vê os registros no painel do Supabase (Table Editor), que não passa por estas permissões.

create table public.contact_requests (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  topic      text not null check (topic in ('orcamento', 'teste', 'reuniao', 'suporte', 'outro')),
  name       text not null check (char_length(name) between 1 and 100),
  phone      text not null check (phone ~ '^[0-9]{10,15}$'),
  message    text not null default '' check (char_length(message) <= 1000),
  -- Só se grava com autorização marcada pela pessoa.
  consent    boolean not null check (consent),
  status     text not null default 'novo' check (status in ('novo', 'respondido', 'arquivado'))
);

comment on table public.contact_requests is 'Pedidos de contato do site, gravados só com autorização da pessoa.';

create index contact_requests_created_at on public.contact_requests (created_at desc);
create index contact_requests_phone on public.contact_requests (phone, created_at desc);

alter table public.contact_requests enable row level security;
-- Sem nenhuma política: os papéis da API não enxergam linha alguma. As permissões também são retiradas.
revoke all on table public.contact_requests from anon, authenticated;

create function public.submit_contact(
  p_topic   text,
  p_name    text,
  p_phone   text,
  p_message text default '',
  p_consent boolean default false,
  p_website text default ''  -- campo-armadilha: pessoas não veem, robôs preenchem
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name    text := btrim(coalesce(p_name, ''));
  v_phone   text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_message text := btrim(coalesce(p_message, ''));
begin
  if coalesce(p_website, '') <> '' then
    return;  -- robô: responde como se tivesse dado certo
  end if;

  if p_consent is not true
     or p_topic is null or p_topic not in ('orcamento', 'teste', 'reuniao', 'suporte', 'outro')
     or char_length(v_name) not between 1 and 100
     or char_length(coalesce(p_phone, '')) > 30
     or v_phone !~ '^[0-9]{10,15}$'
     or char_length(v_message) > 1000 then
    raise exception 'dados de contato inválidos' using errcode = '22023';
  end if;

  -- Um envio por vez, para os limites valerem mesmo com chamadas simultâneas.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('public.submit_contact'));

  if exists (select 1 from public.contact_requests c
              where c.phone = v_phone and c.message = v_message and c.topic = p_topic
                and c.created_at > now() - interval '10 minutes') then
    return;  -- clique repetido
  end if;

  -- Limites por telefone e gerais. Se estourarem, o contato pelo WhatsApp continua funcionando.
  if (select count(*) from public.contact_requests c
        where c.phone = v_phone and c.created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.contact_requests c
        where c.created_at > now() - interval '1 hour') >= 30
     or (select count(*) from public.contact_requests c
        where c.created_at > now() - interval '1 day') >= 150 then
    raise exception 'limite de envios atingido' using errcode = '54000';
  end if;

  insert into public.contact_requests (topic, name, phone, message, consent)
  values (p_topic, v_name, v_phone, v_message, true);
end;
$$;

revoke all on function public.submit_contact(text, text, text, text, boolean, text) from public;
grant execute on function public.submit_contact(text, text, text, text, boolean, text) to anon, authenticated;

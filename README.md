# Aruá Central

Site público da Aruá e Área restrita. TanStack Start, React, Tailwind e Supabase (Lovable Cloud).

## Rodar no computador

```sh
npm install
npm run dev -- --host 127.0.0.1
```

Atenção: o arquivo `.env` aponta para o banco real. Visitas e mensagens enviadas localmente são gravadas nele.

## Verificar

```sh
npm test
npx tsc --noEmit
npm run build
```

## Onde editar

| O quê | Onde |
|---|---|
| Textos da página inicial | `src/content/site.ts` |
| Cores e fontes | `src/styles.css` (`--aru-*`) |
| Projetos base e links de demonstração | Área restrita (`/admin`) |
| Estrutura do banco | `drizzle/migrations/` |

## Acesso à Área restrita

O cadastro público é desativado. Para criar um administrador:

1. Crie o usuário em Cloud → Users, no Lovable.
2. Rode no SQL do banco, trocando o e-mail:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'seu-email@exemplo.com';
```

Para a recuperação de senha funcionar, o endereço do site precisa estar na lista de redirecionamentos permitidos da autenticação.

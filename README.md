# Aruá Central

Site público da Aruá e Área restrita. TanStack Start, React, Tailwind e SQLite. Roda inteiro neste computador, sem serviço externo. Precisa do Node 22.18 ou mais novo.

## Primeiro uso

```sh
npm install
npm run admin      # cria seu e-mail e senha
npm run dev
```

- Site: http://127.0.0.1:8080
- Área restrita: http://127.0.0.1:8080/admin

Para trocar a senha, rode `npm run admin` de novo com o mesmo e-mail. Isso também desfaz o bloqueio por tentativas erradas e encerra as sessões abertas.

## Onde ficam os dados

Tudo fica em `data/arua.db`: projetos, mensagens de contato, visitas e acessos. Essa pasta não vai para o Git, porque guarda dados pessoais. Para ter uma cópia de segurança, pare o site e copie a pasta `data/` para outro lugar. Perder a pasta significa perder os dados.

## Verificar

```sh
npm test
npm run typecheck
npm run build
npm start          # roda a versão gerada pelo build
```

## Onde editar

| O quê | Onde |
|---|---|
| Textos da página inicial | `src/content/site.ts` |
| Cores e fontes | `src/styles.css` (`--aru-*`) |
| Projetos base e links de demonstração | Área restrita (`/admin`) |
| Estrutura do banco | `MIGRATIONS` em `src/server/db.ts` |
| Regras dos dados | `src/lib/schemas.ts` |
| Funções chamadas pelas telas | `src/lib/api.ts` |

## Antes de colocar na internet

Hoje o site abre só neste computador. Para publicar, ainda é preciso:

- um servidor Node com disco permanente, porque o banco é um arquivo;
- HTTPS, com um proxy que entregue o endereço correto ao site, para o cookie de sessão sair marcado como seguro;
- limite de envios no formulário de contato e nas visitas, que hoje não têm;
- trocar os textos marcados com "A DEFINIR".

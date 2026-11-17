# Aruá Central

Site público da Aruá, Área restrita e o produto Aruá Hospedagens. TanStack Start, React, Tailwind e SQLite. Roda sem serviço externo. Precisa do Node 22.18 ou mais novo.

## Primeiro uso

```sh
npm install
npm run admin      # cria seu e-mail e senha; também atualiza a estrutura do banco
npm run dev
```

| Página | Endereço |
|---|---|
| Site | http://127.0.0.1:8080 |
| Área restrita | http://127.0.0.1:8080/admin |
| Serviços, Planos, Aplicações | `/servicos`, `/planos`, `/aplicacoes` |
| Portfólio | http://127.0.0.1:8080/portfolio |
| Suporte e Status dos sistemas | `/suporte`, `/status` |
| Página de um projeto | http://127.0.0.1:8080/projetos/arua-hospedagens |
| Vitrine de demonstração | http://127.0.0.1:8080/hospedagens/demonstracao |
| Demonstrações guiadas da Central de Presença Digital | http://127.0.0.1:8080/demonstracoes |

Para trocar a senha, rode `npm run admin` de novo com o mesmo e-mail. Isso também desfaz o bloqueio por tentativas erradas e encerra as sessões abertas.

## Local, salvo, publicado e online

São quatro coisas diferentes:

| Situação | O que significa |
|---|---|
| Código alterado | Está nos arquivos deste computador. |
| Salvo no banco | Está em `data/arua.db` do servidor onde foi salvo. |
| Publicado | Aparece no site **daquele servidor**. No computador, só você vê. |
| Online | O código foi instalado em um servidor na internet e o conteúdo foi cadastrado no banco dele. |

Nada do banco local vai sozinho para a internet, e o GitHub guarda só o código. Depois que houver um servidor online, o painel dele (`/admin`) passa a ser o lugar oficial do conteúdo.

## Onde ficam os dados

Tudo fica em `data/`: o banco (`arua.db`) e as fotos e vídeos (`uploads/`). Essa pasta não vai para o Git, porque guarda dados pessoais. Para ter uma cópia de segurança, pare o site e copie a pasta inteira. Perder a pasta significa perder os dados.

## Aruá Hospedagens

Cada estabelecimento é um cliente, com vitrine, fotos, modalidades e pedidos próprios. Para cadastrar um cliente real: Área restrita → Hospedagens → Adicionar estabelecimento. Um estabelecimento real só pode ser publicado com WhatsApp preenchido. Na demonstração, sem número, o WhatsApp pede para escolher o contato, assim nenhuma mensagem vai para um desconhecido.

O pedido fica registrado no painel ao chegar no resumo. Ele nunca confirma a reserva, e mudar a situação no painel não avisa o cliente.

## Portfólio ao vivo e seus outros produtos

Cada produto seu (ou trabalho para cliente) é um **projeto** em Área restrita → Projetos, com tipo (produto da Aruá ou case de cliente), categoria, cliente e resultados. Produtos aparecem na página inicial; todos os publicados aparecem no portfólio.

Quando um projeto estiver hospedado, cadastre onde ele roda em **Área restrita → Sistemas no ar** (produção, demonstração ou homologação). Situações:

| Situação | Significado |
|---|---|
| Em preparação | Ainda não está hospedado. Aparece como "Em preparação" e não é verificado. |
| Ativo | Está no ar. É verificado e mostra "No ar" ou "Fora do ar" conforme a última verificação. |
| Em manutenção | Fora do ar de propósito. Não é verificado. |

O botão "Abrir sistema ao vivo" só aparece quando a última verificação deu certo. Para manter a situação atualizada no servidor, agende a verificação a cada 5 minutos:

```sh
*/5 * * * * cd /caminho/do/site && npm run status >> data/status.log 2>&1
```

O comando termina com erro (código 1) quando algum sistema está fora do ar, o que permite ligar um alerta. O histórico das verificações fica guardado por 90 dias.

**Depoimentos** (Área restrita → Depoimentos) só são publicados com a autorização de quem falou marcada; o banco recusa o contrário. Sem depoimentos publicados, a seção não aparece.

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
| Projetos, estabelecimentos, fotos e pedidos | Área restrita (`/admin`) |
| Sistemas no ar e depoimentos | Área restrita (`/admin`) |
| Textos, planos, preços, perguntas frequentes e contato direto | `src/content/site.ts` |
| Textos fixos da vitrine | `src/content/hospedagens.ts` |
| Demonstrações guiadas (dados de cada cliente) | `src/content/demos/` (fontes em `docs/demos/`) |
| Cores e fontes | `src/styles.css` (`--aru-*`) |
| Estrutura do banco | `MIGRATIONS` em `src/server/db.ts` |
| Regras dos dados | `src/lib/schemas.ts` |
| Funções chamadas pelas telas | `src/lib/api.ts` |

## Publicar na internet

O site precisa de um servidor Node com **disco permanente**, porque o banco e as fotos são arquivos. Serviços sem disco permanente, como Cloudflare Workers, não servem para esta versão.

1. Instale o código no servidor: `npm ci` e `npm run build`.
2. Configure um proxy com HTTPS (como Caddy ou Nginx) apontando para o site.
3. Defina as variáveis abaixo e inicie com `node .output/server/index.mjs`.
4. Rode `npm run admin` no servidor para criar o acesso.
5. Para levar o conteúdo local, copie a pasta `data/` com o site parado. Para começar do zero, cadastre tudo pelo painel online.
6. Confira o site pelo endereço público antes de considerar publicado.

| Variável | Para quê | Padrão |
|---|---|---|
| `HOST`, `PORT` | Endereço e porta do site | 127.0.0.1 e 8080 no `npm start` |
| `ARUA_DB_PATH` | Caminho do banco | `data/arua.db` |
| `ARUA_UPLOADS_DIR` | Pasta das fotos e vídeos | `uploads/`, ao lado do banco |
| `ARUA_TRUST_PROXY` | Use `1` só atrás do seu proxy: libera o cookie seguro e o limite de envios por visitante | desligado |

Antes de abrir ao público, troque os textos marcados com "A DEFINIR" e confirme os marcados com "A CONFERIR" em `src/content/site.ts` (WhatsApp, e-mail e endereço ficam ocultos enquanto estiverem vazios). Esse caminho ainda não foi testado em um servidor real.

Para publicar numa VPS com deploy automático (scripts em `deploy/`, workflow **Deploy** com aprovação para produção), siga [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Demonstração para clientes

Versão estática, sem servidor, com dados de exemplo e formulários e área restrita desativados. Cada push na `main` gera a demonstração como artefato para conferir; a publicação no GitHub Pages é **manual** (ainda não publicada: exige repositório público ou plano pago).

```sh
npm run build:demo   # gera dist/client
```

Detalhes em [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

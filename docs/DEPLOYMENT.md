# Publicação — Aruá Central

Estado real em 2026-11-14. Atualize esta página sempre que algo mudar.

## Resumo

| Item                                    | Situação                                                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Repositório                             | `Arua-Solucoes-Digitais/arua-central` (**público**, por decisão do dono, para demonstração)                           |
| Hospedagem de produção                  | **Nenhuma.** O site ainda não está online em servidor algum.                                                          |
| Domínio                                 | Não definido                                                                                                          |
| GitHub Pages                            | Ligado no modo "legacy" (branch `local-sem-lovable`, pasta `/`). Ele mostra **só o README**, não o site. Veja abaixo. |
| CI (`.github/workflows/ci.yml`)         | Roda em todo push e PR: lint, typecheck, testes, build, teste de fumaça e artefato do build                           |
| Deploy (`.github/workflows/deploy.yml`) | Manual. Valida e gera o pacote, depois **para com erro de propósito** até a hospedagem ser definida                   |
| Ambientes no GitHub                     | `staging` (sem aprovação) e `production` (aprovação obrigatória)                                                      |

## O que o site precisa para ir ao ar

O build gera um **servidor Node** (Nitro `node-server`) que guarda o banco SQLite e as fotos em disco. Por isso:

- Precisa de **Node 22.18+** e **disco permanente** (VPS, ou plataforma com volume persistente).
- **Não funciona** em hospedagem só de arquivos estáticos (GitHub Pages, hospedagem compartilhada sem Node) nem em Cloudflare Workers.
- Passo a passo manual: seção "Publicar na internet" do `README.md`.

### Sobre o GitHub Pages

O Pages só serve arquivos estáticos. O painel (`/admin`), os formulários, os pedidos da vitrine e o portfólio dependem do servidor e do banco, então o site completo não roda ali. Para usar o Pages como vitrine de demonstração, seria preciso uma versão estática separada (páginas pré-geradas, sem painel nem formulários). Isso ainda **não existe**.

## Como o deploy vai funcionar (quando houver hospedagem)

1. Push ou PR → **CI** valida tudo e guarda o build como artefato.
2. Alguém dispara **Deploy** manualmente e escolhe `staging` ou `production`.
3. `production` fica esperando a aprovação de um revisor no GitHub.
4. A etapa de deploy usa os _secrets_ do ambiente (nunca no código, nunca nos logs).
5. Rollback: disparar o Deploy de novo num commit anterior (os builds ficam guardados por 30 dias).

Para ativar, falta:

- [ ] Escolher a hospedagem
- [ ] Implementar a etapa de deploy para esse provedor em `deploy.yml`
- [ ] Cadastrar `DEPLOY_METHOD` (variável) e as credenciais (_secrets_) nos ambientes
- [ ] Configurar disco permanente, proxy HTTPS e `ARUA_TRUST_PROXY=1` no servidor
- [ ] Rodar `npm run admin` no servidor
- [ ] Primeiro deploy de produção, **com aprovação**

## Variáveis do servidor

| Variável           | Uso                                         |
| ------------------ | ------------------------------------------- |
| `HOST`, `PORT`     | Endereço e porta                            |
| `ARUA_DB_PATH`     | Caminho do banco (disco permanente)         |
| `ARUA_UPLOADS_DIR` | Pasta das fotos e vídeos (disco permanente) |
| `ARUA_TRUST_PROXY` | `1` só atrás do proxy HTTPS                 |

Nenhuma delas é secreta, mas o **arquivo do banco é**: ele tem dados pessoais e nunca vai para o Git.

## Histórico de publicações

| Data | Versão | Ambiente | Responsável | Observações                  |
| ---- | ------ | -------- | ----------- | ---------------------------- |
| —    | —      | —        | —           | Nenhuma publicação até agora |

# Publicação — Aruá Central

Estado real em 2026-11-14. Atualize esta página sempre que algo mudar.

O site tem **duas formas de publicação**, com objetivos diferentes:

|                        | Demonstração (GitHub Pages)                                         | Site real (VPS)                                                    |
| ---------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Para quê               | Mostrar ao cliente, de qualquer lugar                               | Funcionar de verdade: painel, pedidos, contato                     |
| Endereço               | https://arua-solucoes-digitais.github.io/arua-central/              | Domínio próprio (a definir)                                        |
| Dados                  | Exemplo, de um banco novo (nunca `data/arua.db`)                    | Banco real no servidor                                             |
| Formulários e `/admin` | Desativados (aviso na tela)                                         | Funcionam                                                          |
| Workflow               | `pages.yml`: gera a cada push na `main`; **publica só manualmente** | `.github/workflows/deploy.yml` (manual, produção com aprovação)    |
| Custo                  | Grátis                                                              | VPS + domínio (abaixo)                                             |
| Situação               | Gerada e conferida; **não publicada** (repo privado, ver abaixo)    | Scripts prontos e testados em simulação; **falta contratar a VPS** |

## 0. Site público no domínio (Cloudflare)

`aruasolucoes.com.br` (DNS na Cloudflare desde 26/11/2026) recebe a versão **estática** do site, como
arquivos do Worker `arua-central`. Não há servidor nem banco: o contato abre o WhatsApp.

- Publicar (só com aprovação do responsável): `npm run deploy:site`. Precisa de `wrangler login` na conta
  da Aruá. O comando recria os dados de exemplo, gera o site e envia.
- A conta que tem o domínio e o Worker **não** é necessariamente a que está logada no computador. Se o
  deploy disser "Could not find zone", rode `npx wrangler@4.110.0 login` e escolha a conta do domínio.
- Publicação automática (Workers Builds, no painel do Worker → Settings → Build): comando de build
  `npm run demo:snapshot && npm run build:site`, comando de deploy
  `npx wrangler deploy -c deploy/cloudflare/wrangler.jsonc`, variável `NODE_VERSION=22.18`.
- Gerar sem publicar: `npm run build:site` (saída em `dist/client`).
- Diferenças para a demonstração: sem aviso de demonstração, sem link para a área restrita e para o status
  (`VITE_ARUA_PUBLIC_SITE=1`); cabeçalhos de segurança em `deploy/cloudflare/_headers`.
- Voltar a uma versão anterior: `npx wrangler@4.110.0 rollback -c deploy/cloudflare/wrangler.jsonc`.

## 1. Demonstração estática (GitHub Pages)

`npm run build:demo` gera páginas HTML pré-renderizadas em `dist/client/`:

- `src/demo/api.ts` substitui `src/lib/api.ts` (plugin no `vite.config.ts`). As leituras vêm de `src/demo/snapshot.json`; nada é gravado.
- `npm run demo:snapshot` recria o `snapshot.json` a partir de um banco **novo e temporário** (só as migrações). O workflow roda isso antes de cada build.
- **Projetos na demo:** depois de publicar ou editar um projeto no `/admin` local, rode `npm run demo:export-projects`. Ele grava em `src/demo/projects.json` só os projetos **publicados** e só os campos públicos (sem rascunhos, mensagens, pedidos, usuários ou fotos). Faça o commit desse arquivo e publique a demo.
- Na demonstração, o pedido de reserva monta o resumo e abre o WhatsApp sem número (a pessoa escolhe o contato); o contato e o `/admin` mostram que estão desativados.
- O teste `src/demo/api.test.ts` falha se alguma função nova de `src/lib/api.ts` não tiver substituta na demonstração.

Testar localmente: `npm run build:demo` e servir `dist/client` em `/arua-central/` (ex.: copiar para `algum-dir/arua-central` e rodar `python3 -m http.server` em `algum-dir`).

**Publicação manual e só com autorização.** Um push na `main` apenas gera a demonstração e a guarda como artefato `demo-site-<commit>` (14 dias) em Actions, para conferir. Para publicar: Actions → _Demo (GitHub Pages)_ → _Run workflow_ → digitar `PUBLICAR`.

**Bloqueio atual:** o repositório está **privado** e a organização está no plano **gratuito**: nesse caso o GitHub não oferece Pages. Para publicar é preciso (a) tornar o repositório público, (b) assinar GitHub Team, ou (c) publicar a pasta gerada em outro serviço estático. Depois disso, em Settings → Pages, a origem precisa ser **GitHub Actions**, e o ambiente `github-pages` precisa aceitar a branch `main` (hoje aceita só `local-sem-lovable`).

**Conferir antes de publicar:** baixe o artefato `demo-site-<commit>` em Actions, extraia numa pasta `algum-dir/arua-central/` e rode `python3 -m http.server` dentro de `algum-dir`; abra `http://127.0.0.1:8000/arua-central/`.

## 2. Site real na VPS

O build gera um **servidor Node** (Nitro `node-server`) que guarda o banco SQLite e as fotos em disco: precisa de Node 22.18+ e **disco permanente**. Não roda em GitHub Pages, hospedagem compartilhada sem Node nem Cloudflare Workers.

### Arquitetura no servidor

```
Internet → Caddy (HTTPS automático, portas 80/443)
            ├─ dominio.com.br             → 127.0.0.1:8080  arua-central@production
            └─ homologacao.dominio.com.br → 127.0.0.1:8081  arua-central@staging
/srv/arua-central/<ambiente>/
  releases/<data>-<commit>/   versões instaladas (guarda as 5 últimas)
  current -> releases/...     versão no ar
  shared/env                  variáveis do ambiente (chmod 600)
  shared/data/                banco e uploads (nunca apagados pelo deploy)
  shared/backups/             cópia do banco antes de cada deploy (15 últimas)
```

| Arquivo               | Função                                                                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deploy/setup-vps.sh` | Prepara uma VPS Ubuntu 24.04 nova, **uma vez**: Node 22 (binário oficial com checksum), Caddy, firewall, atualizações automáticas, usuário `arua`, pastas, serviços e o comando `arua-admin` |
| `deploy/release.sh`   | Em cada deploy: backup do banco → troca de versão → reinício → teste em `127.0.0.1` → **volta sozinho** para a versão anterior se o teste falhar                                             |
| `deploy/systemd/`     | Serviço do site e verificação de "Sistemas no ar" a cada 5 minutos                                                                                                                           |

**Testado:** o `release.sh` foi exercitado numa simulação local com o servidor real (3 deploys, backup do banco, deploy quebrado com volta automática, 3 rollbacks em sequência, recusa sem versão anterior); o site respondeu 200 em todos os passos. **Não testado:** o `setup-vps.sh` e o workflow de deploy ainda não rodaram numa VPS de verdade.

### Passo a passo (quando a VPS existir)

1. Contratar uma VPS com **Ubuntu 24.04 LTS** (1 vCPU e 1–4 GB de RAM bastam).
2. No computador: gerar a chave só para o deploy
   `ssh-keygen -t ed25519 -f ~/.ssh/arua_deploy -C github-actions-arua -N ""`
3. Na VPS, como root:
   `curl -fsSLO https://raw.githubusercontent.com/Arua-Solucoes-Digitais/arua-central/main/deploy/setup-vps.sh`
   `bash setup-vps.sh --domain SEU-DOMINIO --staging-domain homologacao.SEU-DOMINIO --deploy-key "$(conteúdo de ~/.ssh/arua_deploy.pub)"`
4. DNS: apontar os domínios para o IP da VPS (registros A/AAAA). **Feito por você** no painel do domínio.
5. GitHub → Settings → Environments → `staging` e `production`, em cada um:
   - _Variables_: `DEPLOY_METHOD=ssh`, `SITE_URL=https://…` (endereço daquele ambiente)
   - _Secrets_: `VPS_HOST` (IP), `VPS_USER=arua`, `VPS_SSH_KEY` (conteúdo de `~/.ssh/arua_deploy`), `VPS_KNOWN_HOSTS` (saída de `ssh-keyscan -t ed25519 IP-DA-VPS`)
6. Actions → **Deploy** → `staging` / `deploy`. Conferir o endereço de homologação.
7. Na VPS: `sudo arua-admin staging` (cria o login).
8. Actions → **Deploy** → `production` / `deploy` → no campo _confirm_ digite `PRODUCAO` (só quem estiver na variável `PRODUCTION_APPROVERS` consegue). Depois `sudo arua-admin production`.

**Rollback:** Actions → Deploy → ambiente → `rollback` (volta uma versão por vez). O banco **não** é revertido sozinho; se precisar, os backups estão em `shared/backups/`.

### Custo estimado (pesquisado em 2026-11-14, confira no site do provedor)

| Item                                      | Estimativa                                            | Observação                                                     |
| ----------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| VPS Hostinger KVM 1 (1 vCPU, 4 GB, 50 GB) | ~R$ 25–28/mês em contrato longo; renovação ~R$ 48/mês | Tem data center no Brasil (menor latência para clientes daqui) |
| VPS Hetzner CX23 (2 vCPU, 4 GB)           | ~€ 5,49/mês + impostos                                | Sem data center no Brasil; disponibilidade varia               |
| VPS DigitalOcean Basic 1 GB               | ~US$ 6/mês (+20% com backup semanal)                  | Sem data center no Brasil                                      |
| Domínio `.com.br` (Registro.br)           | ~R$ 40/ano                                            | Se ainda não tiver                                             |
| GitHub (Actions + Pages)                  | R$ 0                                                  | Pages exige repositório público ou plano pago                  |

Estimativa total: **cerca de R$ 30 a R$ 60 por mês**, conforme provedor, câmbio e período de contrato. Homologação e produção cabem na mesma VPS.

## Proteções

- **Repositório privado no plano gratuito:** o GitHub não aplica proteção de branch nem revisor obrigatório em ambientes. As regras configuradas antes (PR + CI na `main`, aprovação em `production`) **deixaram de valer**.
- Produção protegida no próprio workflow: job _Production gate_ exige digitar `PRODUCAO` e que quem disparou esteja na variável de repositório `PRODUCTION_APPROVERS`. Sem essa variável, nenhum deploy de produção passa.
- Ambiente `production`: só a partir da `main` (regra de branch, ainda ativa).
- Na `main`, por combinação da equipe: mudanças só por PR com CI verde, sem force push nem exclusão de branch.
- Chaves só em _GitHub Secrets_; host SSH verificado (`known_hosts`), chave restrita (`restrict`) e o usuário de deploy só pode **reiniciar** o próprio serviço.
- O serviço roda com sistema de arquivos somente leitura, exceto a própria pasta `shared/`.

## Variáveis do servidor (`shared/env`, criado pelo `setup-vps.sh`)

| Variável           | Uso                                              |
| ------------------ | ------------------------------------------------ |
| `HOST`, `PORT`     | 127.0.0.1 e 8080 (produção) / 8081 (homologação) |
| `ARUA_DB_PATH`     | Banco no disco permanente                        |
| `ARUA_UPLOADS_DIR` | Fotos e vídeos no disco permanente               |
| `ARUA_TRUST_PROXY` | `1` (atrás do Caddy)                             |

Nenhuma é secreta, mas o **arquivo do banco é**: tem dados pessoais e nunca vai para o Git.

## Histórico de publicações

| Data | Versão | Ambiente | Responsável | Observações                  |
| ---- | ------ | -------- | ----------- | ---------------------------- |
| —    | —      | —        | —           | Nenhuma publicação até agora |

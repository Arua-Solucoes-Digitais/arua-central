# Demonstração guiada — Rogerinho Burguer's

Central de Presença Digital da Aruá aplicada ao diagnóstico do Rogerinho Burguer's.
Endereço: `/demonstracoes/rogerinho-burguers` (no GitHub Pages: `/arua-central/demonstracoes/rogerinho-burguers/`).

| Item            | Situação                                                               |
| --------------- | ---------------------------------------------------------------------- |
| Cliente         | Rogerinho Burguer's (hamburgueria, Sagrada Família, Belo Horizonte/MG) |
| Desenvolvimento | Aruá Soluções Digitais                                                 |
| Tipo            | Demonstração guiada, estática, sem login e sem gravação                |
| Dados           | Diagnóstico inicial de 31/10/2026 (perfis públicos)                    |
| Indexação       | `noindex, nofollow`: acessível pelo link, fora dos buscadores          |

## Onde fica cada coisa

| O quê                                                    | Arquivo                                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Dados do cliente (únicos específicos do Rogerinho)       | `src/content/demos/rogerinho-burguers.ts`                               |
| Contrato dos dados (natureza, certeza, status)           | `src/content/demos/types.ts`                                            |
| Registro dos clientes, ordem das áreas, textos da visita | `src/content/demos/index.ts`                                            |
| Telas (iguais para qualquer cliente)                     | `src/components/demos/`                                                 |
| Rotas                                                    | `src/routes/demonstracoes.*.tsx`                                        |
| Cores do cliente (tema escopado)                         | `.demo-theme-rogerinho` em `src/styles.css`                             |
| Testes                                                   | `src/content/demos/demos.test.ts`, `src/components/demos/demo.test.tsx` |

**Outro cliente:** criar `src/content/demos/<slug>.ts` com o mesmo contrato, registrar em `demos` (`index.ts`) e criar `.demo-theme-<slug>` em `src/styles.css`. Nenhuma tela é duplicada. Não há cadastro, multiempresa nem permissões: isso só faz sentido na versão operacional.

**Por que os dados estão no código e não no banco:** a demonstração precisa funcionar no GitHub Pages, sem servidor. São dados públicos, fixos e com fonte; nada vem de `data/arua.db`.

## Fonte de cada informação

Projeto original (somente leitura, não modificado): `ARUA-DEVELOPMENT/projetos/rogerinho-burguer/`.

| Conteúdo da demo                                                | Documento de origem                                                           |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Nome, variações de grafia, endereço, links                      | `00_BRIEFING/DIAGNOSTICO.md`                                                  |
| Indicadores do marco inicial (4,4 · 419 · 1.188 · 69)           | `00_BRIEFING/DIAGNOSTICO.md`, seção "Ponto de partida"                        |
| Pontos fortes, 8 oportunidades, hipóteses, o que falta          | `00_BRIEFING/DIAGNOSTICO.md`, `08_ANOTA_AI/OBSERVACOES.md`                    |
| Situação da proposta (aguardando aprovação)                     | `docs/project/business-context.md`, `docs/client/approved-services.md`        |
| Plano de 2 meses (19 atividades: 1 em andamento, 18 planejadas) | `docs/project/project-status.md` e plano inicial da Central original          |
| Perguntas pendentes ao proprietário                             | Configuração inicial da Central original (`open_questions`)                   |
| Indicadores indisponíveis e como medir                          | `09_METRICAS/COMO_MEDIR.md`, `docs/project/business-context.md`               |
| Regras e roteiros de avaliações                                 | `06_GOOGLE/ESTRATEGIA_AVALIACOES.md`                                          |
| Pesquisa de satisfação                                          | `07_PESQUISAS_CLIENTES/ROTEIRO_PESQUISA.md`                                   |
| Pilares, meses, "como medimos", continuidade                    | `01_APRESENTACAO/ROTEIRO_APRESENTACAO.md`, `11_CONTINUIDADE/OPORTUNIDADES.md` |
| Cores de referência                                             | `docs/design/design-system.md`                                                |

## Fato, hipótese e simulação

- **Real:** os quatro números do marco inicial, sempre com data (31/10/2026) e fonte. Não são números atuais nem resultados da Aruá.
- **Ainda não disponível:** alcance, visualizações, visitas ao perfil, toques no link e pedidos com origem. Sem acesso aos painéis na data do diagnóstico; nenhum valor estimado.
- **Hipótese:** fotos possivelmente ilustrativas no Anota AI; canais de pedido ativos (iFood/Rappi).
- **Pendente de confirmação:** bebidas esgotadas na captura.
- **Simulação:** os três exemplos de publicação e o material de aprovação, marcados "Exemplo conceitual — não publicado".
- Sem gráfico de evolução: só existe uma medição.
- Endereço exibido sem número até o proprietário confirmar 225 ou 225A.

## O que ficou de fora de propósito

- Banco `sistema/dados/central.db`, `ACESSOS.txt`, PINs, sessões e cookies.
- Conversas de WhatsApp e qualquer dado de consumidor.
- Telefones da loja (fixo e WhatsApp): a demo não precisa deles.
- Nome do proprietário (aparece como "proprietário").
- Capturas de tela, logotipo, mascote e fotos: contêm a identidade visual da loja, sem autorização de uso. A demo usa o monograma "RB" e espaços reservados.
- Preços e valores da proposta.

## Limites da demonstração

Aprovar, pedir ajustes, registrar atividade, evidência, medição ou publicação aparecem como **botões demonstrativos**: só exibem "Disponível na versão operacional mediante implantação". Não há formulário, login, `localStorage`, envio de mensagem nem integração com Instagram, Google ou Anota AI.

A visita guiada guarda apenas, em memória, se a orientação está aberta. O roteador do site guarda a posição de rolagem no `sessionStorage` (comportamento de todo o site).

## Antes de publicar

- Confirmar com o proprietário que a loja pode aparecer numa demonstração pública da Aruá (os dados são de perfis públicos, mas o uso como vitrine é decisão dele). A página não é indexada, mas é acessível por link a partir de `/aplicacoes` → `/demonstracoes`.
- Conferir no build estático (ver `docs/DEPLOYMENT.md`) e publicar só pelo fluxo manual com `PUBLICAR`.

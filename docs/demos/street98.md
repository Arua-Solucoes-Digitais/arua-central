# STREET98 — exemplo do produto Aruá E-commerce

No portfólio, o produto **Aruá E-commerce** usa a loja da STREET98 (prata 925) como site de exemplo.

| Item            | Situação                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Cliente         | STREET98 (Instagram @street_98pratas)                                                                                                      |
| Desenvolvimento | Aruá Soluções Digitais                                                                                                                     |
| Autorização     | Solicitada pelo responsável da Aruá em 19/11/2026. **Pendente:** guardar o comprovante do proprietário da STREET98 e anotar aqui onde está |
| Endereço        | https://arua-solucoes-digitais.github.io/street98pratas-vitrine-digital/ (GitHub Pages do repositório público)                             |
| Código          | Repositório `Arua-Solucoes-Digitais/street98pratas-vitrine-digital` (só o necessário para construir o site)                                |

## O que a demonstração é

Build estático de demonstração: **dados de exemplo, nenhum pedido é enviado** e há uma faixa "Site de
demonstração" no topo. Não mostra custos, nem clientes, nem preços reais.

## Atenção

- O endereço depende do repositório estar **público** (plano Free do GitHub). Quando ele virar privado, a
  demonstração sai do ar: publicar a demo no Cloudflare Pages (`npm run build:demo`, saída `dist/client`) e
  trocar o link do produto em `/admin` e em `src/demo/projects.json` (depois `npm run demo:snapshot`).
- Se a autorização for retirada: despublicar o produto no painel, remover a entrada de `src/demo/projects.json`,
  rodar `npm run demo:snapshot` e republicar a demo.

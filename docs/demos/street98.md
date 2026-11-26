# STREET98 — exemplo do produto Aruá E-commerce

No portfólio, o produto **Aruá E-commerce** abre uma **demonstração** da vitrine da STREET98.

| Item | Situação |
|---|---|
| Cliente | STREET98 (prata 925) |
| Desenvolvimento | Aruá Soluções Digitais |
| Autorização | Em 26/11/2026 o responsável da Aruá informou que o cliente autorizou o uso no portfólio. **Guardar o comprovante por escrito e anotar aqui onde está** |
| Endereço no card | https://arua-street98-demo.aruasolucoes.workers.dev/ (abre em nova aba) |
| Como é gerada | Repositório privado `street98pratas-vitrine-digital`, `npm run deploy:demo` (ver `docs/DEMO.md` lá) |

## A demonstração

- Selo "Demonstração STREET98 · feita por Aruá" e botão **Voltar à Aruá** na vitrine.
- Produtos e preços de exemplo. Os contatos da loja não entram no código; WhatsApp e Instagram são os da Aruá.
- Não há pedido real, pagamento, banco, consulta de CEP nem frete; o navegador bloqueia conexões com outros sites.
- O JavaScript é ofuscado. Isso dificulta a cópia, mas **não é criptografia**.
- Não se atualiza sozinha: depois de mudar a vitrine, publicar de novo.

Se a autorização for retirada: tirar o link no `/admin`, rodar `npm run demo:export-projects` e
`npm run demo:snapshot`, publicar o site e apagar o Worker `arua-street98-demo`.

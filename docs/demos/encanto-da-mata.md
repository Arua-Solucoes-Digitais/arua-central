# Pousada Encanto da Mata — projeto e proposta

Case do portfólio, com o botão "Ver demonstração" levando à apresentação do projeto e à proposta.

| Item            | Situação                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------ |
| Cliente         | Pousada Encanto da Mata (Sítios Ipê Amarelo, Sabará/MG) — @pouso_encantodamata             |
| Desenvolvimento | Aruá Soluções Digitais                                                                     |
| Apresentação    | `/demonstracoes/encanto-da-mata`                                                           |
| Proposta        | Plano Digital Profissional, 3 meses de teste grátis, depois R$ 1.149/mês (17/11/2026)      |
| Autorização     | Uso do nome, fotos e valores autorizado pelo proprietário (informado em 17/11/2026)        |
| WhatsApp        | Em todas as peças da demonstração: o da Aruá, +55 (38) 99963-6208. Nunca o do proprietário |
| Indexação       | `noindex, nofollow` em todas as páginas: não concorre com o site real da pousada           |

**Pendente:** guardar o comprovante da autorização por escrito (mensagem, e-mail ou termo) junto aos
documentos do cliente e anotar aqui onde ele está. Se a autorização for retirada: apagar
`public/demos/encanto-da-mata/` e `src/content/demos/encanto-da-mata.ts`, despublicar o case no painel,
rodar `npm run demo:export-projects` e `npm run demo:snapshot` e republicar a demo.

## As três peças

| Peça                        | Endereço                             | Observação                                                         |
| --------------------------- | ------------------------------------ | ------------------------------------------------------------------ |
| Site próprio                | `/demos/encanto-da-mata/index.html`  | Cópia do site estático, com faixa de demonstração e `noindex`      |
| Painel do proprietário      | `/demos/encanto-da-mata/painel.html` | Sem Supabase configurado: abre só com dados de exemplo (fictícios) |
| Vitrine no Aruá Hospedagens | `/hospedagens/encanto-da-mata`       | Criada de `public/demos/encanto-da-mata/property.json`             |

- O site e a vitrine usam os mesmos arquivos (`img/`, `video/`), sem duplicar fotos no repositório.
- Servidor (local ou VPS): `npm run property:import -- public/demos/encanto-da-mata` cria a vitrine
  (cópia do banco antes; recusa se o endereço já existir). Depois, edita-se pelo painel `/admin`.

### Diferenças da cópia em relação ao original

O original fica em `~/Área de trabalho/EncandoDaMata/site/` e não foi modificado. Na cópia:

- `SITE.whatsapp` trocado pelo WhatsApp da Aruá;
- faixa "Demonstração da Aruá…" com link de volta à apresentação, e `noindex, nofollow`;
- `overflow-x: clip` no `html`/`body`: no original, a animação de entrada da foto da promoção
  passava da largura no celular (rolagem lateral de 17 px). **Vale corrigir também no original.**

## Fonte de cada informação

| Conteúdo                                | Origem                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| Nome, endereço, link do Maps, Instagram | `site/index.html` (bloco `SITE`), `plataforma/CONTEUDO-PENDENTE.md`          |
| Acomodações, itens, diárias, capacidade | `site/index.html` (bloco `ROOMS`), legendas dos posts de nov/2026            |
| Funcionalidades do site e do painel     | `site/LEIA-ME.md`                                                            |
| Fotos e vídeo (sem som)                 | `site/img/`, `site/video/` (recortes de capturas, até 780 px)                |
| Plano e preço                           | `plans` em `src/content/site.ts`, confirmados pelo responsável em 17/11/2026 |

## Deixado de fora da vitrine, de propósito

Promoções de Natal (prazo e dúvida de acomodação; o site próprio já as mostra e esconde sozinho),
distância até a Praça Sete (não confirmada), horários de entrada e saída (não informados) e avaliações
(nenhuma real recebida).

## Para melhorar

- Fotos originais em alta resolução.
- Capa (poster) para vídeos na vitrine do Aruá Hospedagens (melhoria do produto, vale para todos).

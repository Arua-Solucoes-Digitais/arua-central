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
rodar `npm run demo:export-projects` e `npm run demo:snapshot`, trocar o link de demonstração do Aruá Hospedagens no painel e republicar a demo.

## O que está no ar

| Peça                    | Endereço                             | Observação                                                           |
| ----------------------- | ------------------------------------ | -------------------------------------------------------------------- |
| Site próprio            | `/demos/encanto-da-mata/index.html`  | Cópia do site como está no projeto, com a camada de pré-visualização |
| Painel do proprietário  | `/demos/encanto-da-mata/painel.html` | Sem Supabase configurado: abre só com dados de exemplo (fictícios)   |
| Apresentação + proposta | `/demonstracoes/encanto-da-mata`     | Site, painel e plano Digital Profissional com 3 meses grátis         |

- O "Ver demonstração" do card **Aruá Hospedagens** abre o site da pousada (migração 4, 17/11/2026).
  As vitrines do produto no modelo padrão (a do Encanto e a fictícia "Sítio Recanto do Ipê") foram
  apagadas a pedido do responsável.
- O case **Pousada Encanto da Mata** no portfólio abre a apresentação com a proposta.

### Diferenças da cópia em relação ao original

O original fica em `ARUA-DEVELOPMENT/projetos/encanto-da-mata/site/` e não foi modificado. Na cópia
(`diff` mostra só estas linhas):

- `SITE.whatsapp` trocado pelo WhatsApp da Aruá;
- `<meta name="robots" content="noindex, nofollow">`;
- `overflow-x: clip` no `html`/`body`: no original, a animação de entrada da foto da promoção passa
  da largura no celular (rolagem lateral de 17 px). **Vale corrigir também no original;**
- `<script src="arua-preview.js">` no fim do `index.html` e do `painel.html`: borrão progressivo fixo no
  rodapé (160 px, `blur(16px)`, máscara de baixo para cima, sem capturar cliques), marca d'água
  "Modo demonstração • Aruá ©" e botão "Quero um site assim" (abre o WhatsApp da Aruá). O borrão fica
  abaixo da barra de reserva e do botão de WhatsApp do site, para não atrapalhar o uso; o botão sobe
  acima da barra de reserva no celular.

Para atualizar a cópia depois de mudar o site original: copiar de novo os arquivos e reaplicar só as
linhas acima.

## Fonte de cada informação

| Conteúdo                                | Origem                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| Nome, endereço, link do Maps, Instagram | `site/index.html` (bloco `SITE`), `plataforma/CONTEUDO-PENDENTE.md`          |
| Acomodações, itens, diárias, capacidade | `site/index.html` (bloco `ROOMS`), legendas dos posts de nov/2026            |
| Funcionalidades do site e do painel     | `site/LEIA-ME.md`                                                            |
| Fotos e vídeo (sem som)                 | `site/img/`, `site/video/` (recortes de capturas, até 780 px)                |
| Plano e preço                           | `plans` em `src/content/site.ts`, confirmados pelo responsável em 17/11/2026 |

## Para melhorar

- Fotos originais em alta resolução (as atuais são recortes de capturas de tela).

# Vitrine de demonstração — Pousada Encanto da Mata

Exemplo real do produto **Aruá Hospedagens**, montado com o material da pousada.
Endereço: `/hospedagens/encanto-da-mata` (no GitHub Pages: `/arua-central/hospedagens/encanto-da-mata/`).
É o exemplo aberto pelo botão de demonstração da página do produto no Pages.

| Item            | Situação                                                                            |
| --------------- | ----------------------------------------------------------------------------------- |
| Cliente         | Pousada Encanto da Mata (Sítios Ipê Amarelo, Sabará/MG) — @pouso_encantodamata      |
| Desenvolvimento | Aruá Soluções Digitais                                                              |
| Tipo            | Vitrine do Aruá Hospedagens em modo demonstração (`is_demo`), sem WhatsApp          |
| Autorização     | Uso do nome, fotos e valores autorizado pelo proprietário (informado em 17/11/2026) |
| Indexação       | `noindex, nofollow`: não concorre com o site próprio da pousada nos buscadores      |

**Pendente:** guardar o comprovante da autorização por escrito (mensagem, e-mail ou termo) junto aos
documentos do cliente e anotar aqui onde ele está. Se a autorização for retirada, apague a pasta
`src/demo/properties/encanto-da-mata/`, rode `npm run demo:snapshot` e republique a demo.

## Como funciona

- Os pedidos de reserva não chegam à pousada: sem número, o WhatsApp pede para escolher o contato,
  e a mensagem diz que é uma demonstração.
- Dados e fotos: `src/demo/properties/encanto-da-mata/` (`property.json` + arquivos). Nada vem de `data/arua.db`.
- Demo estática: `npm run demo:snapshot` cria a vitrine num banco novo, pelas mesmas validações do painel.
- Servidor (local ou VPS): `npm run property:import -- src/demo/properties/encanto-da-mata`
  (faz cópia do banco em `data/backups/` antes; recusa se o endereço já existir). Depois disso,
  edita-se pelo painel `/admin`, como qualquer vitrine.

## Fonte de cada informação

Projeto original (somente leitura, não modificado): `~/Área de trabalho/EncandoDaMata/`.

| Conteúdo                                 | Origem                                                                                  |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| Nome, endereço, link do Maps, Instagram  | `site/index.html` (bloco `SITE`), `plataforma/CONTEUDO-PENDENTE.md`                     |
| Acomodações, itens, diárias e capacidade | `site/index.html` (bloco `ROOMS`), legendas dos posts de nov/2026                       |
| Comodidades                              | `site/index.html` (bloco `AMENITIES`)                                                   |
| Fotos e textos alternativos              | `site/img/` e blocos `GALLERY`/`FLOWERS` (recortes de capturas, até 780 px)             |
| Vídeo de apresentação (sem som)          | `site/video/apresentacao.mp4` (áudio descartado; ver `plataforma/producao/LICENCAS.md`) |

## Deixado de fora de propósito

- **Promoções de Natal** (Suíte Master R$ 1.799 e pacote de R$ 999): têm prazo (24/12/2026) e ainda há
  dúvida sobre a acomodação e os itens; numa demo estática ficariam vencidas.
- **Distância até a Praça Sete** (marcada como "CONFIRMAR" no site original).
- **Horários de entrada e saída**: não informados. Disponibilidade aparece como "Sob consulta".
- **WhatsApp real**: nunca entra numa demonstração.
- **Avaliações**: não há avaliações reais recebidas.

## Para melhorar

- Fotos originais em alta resolução (as atuais são recortes de capturas de tela).
- Capa (poster) para vídeos na vitrine: hoje o vídeo aparece como quadro preto até tocar
  (melhoria do produto, vale para todos os clientes).

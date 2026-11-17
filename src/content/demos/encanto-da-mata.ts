// Apresentação do projeto da Pousada Encanto da Mata (/demonstracoes/encanto-da-mata).
// Uso de nome, fotos e valores autorizado pelo proprietário: ver docs/demos/encanto-da-mata.md.
// Os arquivos ficam em public/demos/encanto-da-mata: cópia do site e do painel, como estão no projeto.
import type { PlanOffer } from "./types";

const FILES = "/demos/encanto-da-mata";

export type ShowcasePiece = {
  id: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
  /** Arquivo estático em public/, aberto em nova aba. */
  href: string;
  note?: string;
  image: string;
  imageAlt: string;
};

export const encantoShowcase = {
  slug: "encanto-da-mata",
  name: "Pousada Encanto da Mata",
  place: "Sabará · MG",
  eyebrow: "Projeto Aruá",
  intro:
    "Tudo o que a Aruá montou para a pousada receber mais pedidos de reserva, com menos mensagens soltas: o site próprio e o painel do proprietário.",
  notice:
    "Demonstração: as mensagens enviadas por estas páginas vão para o WhatsApp da Aruá, não para a pousada.",
  hero: {
    src: `${FILES}/img/deck-rede.jpg`,
    alt: "Deck coberto de madeira com rede colorida entre as árvores",
  },
  piecesTitle: "O projeto",
  pieces: [
    {
      id: "site",
      title: "Site próprio da pousada",
      description:
        "Página da pousada com fotos, acomodações, comodidades e localização, feita para virar pedido de reserva.",
      features: [
        "Simulador de valor por acomodação, datas e hóspedes, com as promoções válidas no período",
        "Mensagem pronta no WhatsApp, com o código de origem do cliente (site, Instagram ou anúncio)",
        "Links diretos com datas para usar em anúncios e no Instagram",
        "Promoção com prazo que sai do ar sozinha",
      ],
      cta: "Abrir o site",
      href: `${FILES}/index.html`,
      image: `${FILES}/img/piscina.jpg`,
      imageAlt: "Piscina com água azul e pequena cascata junto ao muro de pedra",
    },
    {
      id: "painel",
      title: "Painel do proprietário",
      description:
        "Onde o proprietário acompanha, pelo celular, quem pediu, quem fechou e de onde veio cada cliente.",
      features: [
        "Contatos, reservas fechadas, valor pago e a receber",
        "Origem de cada cliente: site, Instagram ou anúncios, com o nome da campanha",
        "Calendário dos próximos 90 dias com os períodos livres para manutenção",
        "Exportação para planilha",
      ],
      cta: "Abrir o painel",
      href: `${FILES}/painel.html`,
      note: "Na demonstração, use “Ver demonstração com dados de exemplo”: os dados são fictícios e o login fica desativado.",
      image: `${FILES}/img/varanda-cadeiras.jpg`,
      imageAlt: "Varanda com cadeiras de corda azuis voltada para a mata",
    },
  ] satisfies ShowcasePiece[],
  offer: {
    planId: "profissional",
    trialMonths: 3,
    notInTrial: [],
    trialNote:
      "No teste, tudo do plano já vale: redes sociais, fotos e vídeos da pousada, reels e o relatório mensal. Ao fim dos 3 meses, decidimos juntos se continua.",
    status:
      "Proposta apresentada em 17/11/2026, aguardando aprovação do proprietário. Nada é cobrado durante o teste.",
  } satisfies PlanOffer,
};

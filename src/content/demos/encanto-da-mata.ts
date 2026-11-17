// Apresentação do projeto da Pousada Encanto da Mata (/demonstracoes/encanto-da-mata).
// Uso de nome, fotos e valores autorizado pelo proprietário: ver docs/demos/encanto-da-mata.md.
// Os arquivos ficam em public/demos/encanto-da-mata (site estático, painel e fotos da vitrine).
import type { PlanOffer } from "./types";

const FILES = "/demos/encanto-da-mata";

export type ShowcasePiece = {
  id: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  /** Página deste site (roteador) ou arquivo estático aberto em nova aba. */
  kind: "route" | "file";
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
    "Tudo o que a Aruá montou para a pousada receber mais pedidos de reserva, com menos mensagens soltas: site próprio, painel do proprietário e vitrine no Aruá Hospedagens.",
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
      kind: "file",
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
      kind: "file",
      note: "Na demonstração, use “Ver demonstração com dados de exemplo”: os dados são fictícios e o login fica desativado.",
      image: `${FILES}/img/varanda-cadeiras.jpg`,
      imageAlt: "Varanda com cadeiras de corda azuis voltada para a mata",
    },
    {
      id: "vitrine",
      title: "Vitrine no Aruá Hospedagens",
      description:
        "A mesma pousada no produto da Aruá para hospedagens, editável pelo painel, sem mexer em código.",
      features: [
        "Fotos, vídeo, acomodações, valores e comodidades",
        "Pedido de reserva com datas, pessoas e contato, enviado pelo WhatsApp",
        "Endereço e link para o Google Maps e o Instagram",
      ],
      cta: "Abrir a vitrine",
      href: "/hospedagens/encanto-da-mata",
      kind: "route",
      image: `${FILES}/img/suite-master.jpg`,
      imageAlt: "Suíte Master: cama de casal com colcha xadrez",
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

// Tlim © Aruá Soluções Digitais · desenvolvido por CjotaDEV7.
// Dados da demonstração do Tlim. O restaurante "Burger do Bairro" é fictício; os indicadores e as
// oportunidades vêm do diagnóstico real de uma hamburgueria de Belo Horizonte (31/10/2026), sem
// identificá-la. Cardápio, valores, clientes e pedidos são simulação. Fontes: docs/demos/tlim.md.
import type { ClientDemo } from "./types";

export const tlim: ClientDemo = {
  slug: "tlim",
  themeClass: "demo-theme-tlim",
  business: {
    name: "Burger do Bairro",
    initials: "BB",
    segment: "Hamburgueria",
    city: "Belo Horizonte · MG",
    tagline: "Lanches e espaguetes na chapa, com entrega e retirada.",
    basis:
      "Restaurante fictício. Os indicadores e as oportunidades são de uma hamburgueria real de Belo Horizonte (diagnóstico de 31/10/2026), mostrados sem identificá-la. Cardápio, valores, clientes e pedidos são simulação.",
  },

  presentation: {
    headline: "Seu cardápio, seus pedidos e seus clientes num só lugar.",
    lead: "O Tlim recebe os pedidos do cardápio online, organiza a cozinha e dá ao gestor o que falta para vender de novo: clientes, WhatsApp, Instagram e pesquisas de satisfação.",
    problems: [
      {
        title: "Pedidos espalhados",
        text: "Uns chegam pelo WhatsApp, outros pela plataforma, outros pelo telefone. Anotar à mão gera erro e demora.",
      },
      {
        title: "Cliente que some",
        text: "Quem pediu uma vez não fica registrado, então não dá para chamar de volta nem saber quem é fiel.",
      },
      {
        title: "Redes sem ritmo",
        text: "Instagram e WhatsApp sem planejamento: promoções esquecidas, publicações antigas e nenhuma pesquisa com quem comprou.",
      },
    ],
    modules: [
      {
        area: "pedidos",
        title: "Central de pedidos",
        text: "Todo pedido do cardápio online cai num quadro só, com comanda para a cozinha.",
      },
      {
        area: "cardapio",
        title: "Cardápio online",
        text: "Cardápio próprio, com link para a bio, e itens esgotados que saem na hora.",
      },
      {
        area: "crm",
        title: "CRM de vendas",
        text: "Cada cliente com histórico, total gasto e etapa: novo, recorrente ou inativo.",
      },
      {
        area: "whatsapp",
        title: "Disparos no WhatsApp",
        text: "Mensagens por grupo de clientes, só para quem aceitou receber.",
      },
      {
        area: "instagram",
        title: "Agenda do Instagram",
        text: "Posts, reels e stories agendados, com aprovação do dono antes de ir ao ar.",
      },
      {
        area: "pesquisas",
        title: "Pesquisas de satisfação",
        text: "Pesquisa curta depois da entrega e respostas resumidas para melhorar.",
      },
    ],
  },

  indicators: [
    {
      id: "google-nota",
      channel: "Google",
      label: "Nota no Google",
      explain: "Média das avaliações no Perfil da Empresa.",
      value: 4.4,
      decimals: 1,
      nature: "real",
    },
    {
      id: "google-avaliacoes",
      channel: "Google",
      label: "Avaliações no Google",
      explain: "Quantidade total de avaliações.",
      value: 419,
      nature: "real",
    },
    {
      id: "ig-seguidores",
      channel: "Instagram",
      label: "Seguidores no Instagram",
      explain: "Seguidor não é cliente; é alcance possível.",
      value: 1188,
      nature: "real",
    },
    {
      id: "ig-publicacoes",
      channel: "Instagram",
      label: "Publicações no Instagram",
      explain: "Total de publicações no perfil.",
      value: 69,
      nature: "real",
    },
  ],
  indicatorsNote:
    "Números observados em 31/10/2026 no diagnóstico de uma hamburgueria real de Belo Horizonte. São o ponto de partida do exemplo, não resultado do Tlim.",

  strengths: [
    {
      title: "Reputação já construída",
      description: "Nota 4,4 com 419 avaliações no Google: um patrimônio para proteger e mostrar.",
    },
    {
      title: "Identidade visual marcante",
      description: "Mascote, cor forte e artes com a marca nos stories.",
    },
    {
      title: "Caminho de pedido existe",
      description: "Link de pedido na bio do Instagram e botão de pedido on-line no Google.",
    },
    {
      title: "Clientes falam bem",
      description: "Depoimentos espontâneos de clientes nos destaques do Instagram.",
    },
  ],

  opportunities: [
    {
      title: "Dois caminhos de pedido sem orientação",
      description: "Os stories chamam para o WhatsApp e a bio leva à plataforma de pedidos.",
      channel: "Instagram · WhatsApp",
      certainty: "verificado",
      solvedBy: "pedidos",
    },
    {
      title: "Itens e categorias sem foto",
      description: "Parte do cardápio on-line sem foto nem descrição.",
      channel: "Cardápio on-line",
      certainty: "verificado",
      solvedBy: "cardapio",
    },
    {
      title: "Itens esgotados à mostra",
      description: "Bebidas apareciam como esgotadas no momento do diagnóstico.",
      channel: "Cardápio on-line",
      certainty: "pendente",
      solvedBy: "cardapio",
    },
    {
      title: "Destaques e publicações antigas",
      description: "Destaques do Instagram com mais de três anos sem atualização.",
      channel: "Instagram",
      certainty: "verificado",
      solvedBy: "instagram",
    },
    {
      title: "Nenhum registro de quem já pediu",
      description: "Sem histórico, não há como chamar de volta quem sumiu.",
      channel: "Gestão",
      certainty: "hipotese",
      solvedBy: "crm",
    },
    {
      title: "Promoções sem lista organizada",
      description: "Avisos pelo WhatsApp dependem de lembrar quem chamar.",
      channel: "WhatsApp",
      certainty: "hipotese",
      solvedBy: "whatsapp",
    },
    {
      title: "Ninguém pergunta o que o cliente achou",
      description: "Sem pesquisa depois da entrega, as críticas só aparecem no Google.",
      channel: "Google",
      certainty: "hipotese",
      solvedBy: "pesquisas",
    },
  ],

  menu: {
    categories: ["Lanches", "Espaguetes", "Bebidas"],
    items: [
      {
        id: "x-burger",
        category: "Lanches",
        name: "X-Burger",
        description: "Pão, hambúrguer 120 g, queijo, alface e tomate.",
        priceCents: 2200,
      },
      {
        id: "x-salada",
        category: "Lanches",
        name: "X-Salada",
        description: "Pão, hambúrguer 120 g, queijo, presunto, alface, tomate e milho.",
        priceCents: 2400,
      },
      {
        id: "x-bacon",
        category: "Lanches",
        name: "X-Bacon",
        description: "Pão, hambúrguer 120 g, queijo, bacon crocante e molho da casa.",
        priceCents: 2800,
      },
      {
        id: "x-tudo",
        category: "Lanches",
        name: "X-Tudo",
        description: "Pão, dois hambúrgueres, ovo, bacon, presunto, queijo, salada e batata palha.",
        priceCents: 3400,
      },
      {
        id: "espaguete-p",
        category: "Espaguetes",
        name: "Espaguete na chapa · pequeno",
        description: "Espaguete na chapa com carne, queijo e molho.",
        priceCents: 2600,
      },
      {
        id: "espaguete-g",
        category: "Espaguetes",
        name: "Espaguete na chapa · grande",
        description: "A porção grande, para dividir.",
        priceCents: 3800,
      },
      {
        id: "refri-lata",
        category: "Bebidas",
        name: "Refrigerante lata",
        description: "350 ml.",
        priceCents: 650,
      },
      {
        id: "guarana-1l",
        category: "Bebidas",
        name: "Guaraná 1 L",
        description: "Garrafa de 1 litro.",
        priceCents: 1100,
      },
      {
        id: "suco",
        category: "Bebidas",
        name: "Suco natural",
        description: "Laranja ou maracujá, 400 ml.",
        priceCents: 900,
      },
    ],
  },

  customers: [
    {
      id: "c1",
      name: "Ana Paula",
      orders: 9,
      spentCents: 28400,
      lastOrderDays: 2,
      channel: "cardapio",
    },
    {
      id: "c2",
      name: "Bruno",
      orders: 4,
      spentCents: 13200,
      lastOrderDays: 6,
      channel: "whatsapp",
    },
    {
      id: "c3",
      name: "Camila",
      orders: 1,
      spentCents: 3400,
      lastOrderDays: 1,
      channel: "instagram",
    },
    {
      id: "c4",
      name: "Diego",
      orders: 12,
      spentCents: 41800,
      lastOrderDays: 0,
      channel: "cardapio",
    },
    {
      id: "c5",
      name: "Elaine",
      orders: 2,
      spentCents: 6100,
      lastOrderDays: 45,
      channel: "whatsapp",
    },
    {
      id: "c6",
      name: "Fábio",
      orders: 6,
      spentCents: 19900,
      lastOrderDays: 38,
      channel: "cardapio",
    },
    {
      id: "c7",
      name: "Gabriela",
      orders: 1,
      spentCents: 2850,
      lastOrderDays: 0,
      channel: "instagram",
    },
    {
      id: "c8",
      name: "Henrique",
      orders: 3,
      spentCents: 9750,
      lastOrderDays: 61,
      channel: "cardapio",
    },
    {
      id: "c9",
      name: "Isabela",
      orders: 5,
      spentCents: 16500,
      lastOrderDays: 12,
      channel: "cardapio",
    },
    {
      id: "c10",
      name: "João Pedro",
      orders: 1,
      spentCents: 4400,
      lastOrderDays: 3,
      channel: "whatsapp",
    },
  ],

  orders: [
    {
      id: 41,
      customerId: "c4",
      items: [
        { itemId: "x-tudo", qty: 2 },
        { itemId: "guarana-1l", qty: 1 },
      ],
      status: "novo",
      minutesAgo: 2,
      mode: "entrega",
      payment: "pix",
    },
    {
      id: 40,
      customerId: "c7",
      items: [
        { itemId: "x-bacon", qty: 1 },
        { itemId: "refri-lata", qty: 1 },
      ],
      status: "preparo",
      minutesAgo: 11,
      mode: "retirada",
      payment: "cartao",
      note: "Sem cebola, por favor.",
    },
    {
      id: 39,
      customerId: "c1",
      items: [
        { itemId: "espaguete-g", qty: 1 },
        { itemId: "suco", qty: 2 },
      ],
      status: "preparo",
      minutesAgo: 18,
      mode: "entrega",
      payment: "dinheiro",
    },
    {
      id: 38,
      customerId: "c3",
      items: [{ itemId: "x-salada", qty: 1 }],
      status: "saiu",
      minutesAgo: 34,
      mode: "entrega",
      payment: "pix",
    },
    {
      id: 37,
      customerId: "c9",
      items: [
        { itemId: "x-burger", qty: 2 },
        { itemId: "refri-lata", qty: 2 },
      ],
      status: "concluido",
      minutesAgo: 52,
      mode: "retirada",
      payment: "cartao",
    },
  ],

  posts: [
    {
      id: "p1",
      format: "Stories",
      title: "Enquete: qual é o seu preferido?",
      caption: "Qual é o seu preferido? X-Tudo ou espaguete na chapa?",
      dayOffset: 0,
      time: "18:30",
    },
    {
      id: "p2",
      format: "Stories",
      title: "Caixinha de perguntas",
      caption: "Qual lanche você quer ver em promoção?",
      dayOffset: 1,
      time: "12:00",
    },
    {
      id: "p3",
      format: "Reels",
      title: "Da chapa para a sua casa",
      caption: "Do pedido no cardápio on-line até a sua porta. Peça pelo link da bio.",
      dayOffset: 2,
      time: "19:00",
    },
  ],

  templates: [
    {
      id: "promo",
      label: "Promoção do dia",
      text: "Oi, {nome}! Hoje o X-Tudo sai com refrigerante de brinde. Peça pelo nosso cardápio on-line.",
    },
    {
      id: "saudade",
      label: "Sentimos sua falta",
      text: "Oi, {nome}! Faz tempo que você não pede com a gente. Que tal matar a saudade hoje?",
    },
    {
      id: "pesquisa",
      label: "Pesquisa de satisfação",
      text: "Oi, {nome}! Como foi seu último pedido? Responda em 30 segundos e ajude a gente a melhorar.",
    },
  ],

  survey: {
    questions: [
      {
        question: "Como foi sua experiência com nosso atendimento?",
        options: ["Ótima", "Boa", "Regular", "Ruim"],
      },
      {
        question: "O que achou dos nossos lanches?",
        options: ["Adorei", "Gostei", "Poderia ser melhor", "Não gostei"],
      },
      { question: "O que poderíamos melhorar?", options: ["Resposta aberta"] },
    ],
    privacy:
      "Enviada só a quem já pediu e aceitou receber mensagens. As respostas entram sem nome nem telefone.",
  },

  reviewRules: [
    "Convidar todos os clientes a avaliar, não apenas os que parecem satisfeitos.",
    "Nunca oferecer desconto, brinde ou vantagem em troca de avaliação.",
    "Pedir uma opinião sincera, sem sugerir a nota.",
    "Responder todas as avaliações, inclusive as críticas, com educação.",
  ],

  approvals: {
    intro:
      "Nenhum material vai ao ar sem a decisão do dono. Cada decisão fica registrada com data, autor e origem.",
    steps: [
      { title: "Material preparado", detail: "A Aruá produz a peça e descreve objetivo e canal." },
      { title: "Enviado ao dono", detail: "O material aparece aqui, na área de aprovações." },
      { title: "Dono avalia", detail: "Vê a peça pelo celular, com contexto." },
      { title: "Aprova ou pede ajustes", detail: "Pedido de ajuste exige descrição do que mudar." },
      { title: "Vai para a agenda", detail: "Aprovado, o post entra na agenda do Instagram." },
    ],
    sample: {
      title: "Stories: enquete “Qual é o seu preferido?”",
      channel: "Instagram",
      description: "Exemplo de material esperando a decisão do dono.",
    },
  },

  guide: {
    "visao-geral": {
      represents: "O resumo do dia: pedidos, cozinha, vendas e reputação.",
      problem: "Sem um painel, o dono só sabe como foi o dia quando fecha o caixa.",
      howAruaUses: "É a primeira tela do gestor e da Aruá em cada conversa de acompanhamento.",
      whatIsReal: "Os indicadores de reputação. Pedidos e vendas são simulação.",
    },
    pedidos: {
      represents: "A central que recebe todos os pedidos do cardápio online.",
      problem: "Pedidos anotados à mão se perdem, atrasam e saem errados.",
      howAruaUses: "Implantamos o fluxo com a cozinha: aceitar, preparar, entregar.",
      whatIsReal: "O fluxo. Os pedidos são simulação; faça um no cardápio e veja chegar aqui.",
    },
    cardapio: {
      represents: "O cardápio online do restaurante, gerenciado por aqui.",
      problem: "Item esgotado à mostra frustra o cliente e gera pedido cancelado.",
      howAruaUses: "Montamos o cardápio com fotos e descrições, e o dono mantém atualizado.",
      whatIsReal: "A organização. Itens e valores são exemplo.",
    },
    crm: {
      represents: "Quem são os clientes, quanto compram e quando voltaram.",
      problem: "Sem histórico, não dá para reconhecer o cliente fiel nem chamar quem sumiu.",
      howAruaUses: "Definimos os grupos de clientes e as ações para cada um.",
      whatIsReal: "As regras dos grupos. Clientes e valores são simulação.",
    },
    whatsapp: {
      represents: "Mensagens para grupos de clientes, como promoções e lembretes.",
      problem: "Disparar para todo mundo cansa; esquecer de avisar perde venda.",
      howAruaUses: "Escrevemos as mensagens e o calendário de disparos com o dono.",
      whatIsReal: "Nada é enviado. Na versão real, só para quem aceitou receber.",
    },
    instagram: {
      represents: "A agenda de posts, reels e stories do restaurante.",
      problem: "Perfil parado parece restaurante fechado.",
      howAruaUses: "Produzimos e agendamos, sempre com a aprovação do dono.",
      whatIsReal: "A agenda é simulação; as ideias de post vêm do diagnóstico.",
    },
    pesquisas: {
      represents: "A pesquisa curta depois da entrega e o resumo das respostas.",
      problem: "Sem perguntar, a crítica só aparece como nota baixa no Google.",
      howAruaUses: "Montamos as perguntas e lemos as respostas todo mês com o dono.",
      whatIsReal: "As perguntas e as regras. Respostas são simulação.",
    },
    aprovacoes: {
      represents: "Onde o dono decide sobre cada material antes de ir ao ar.",
      problem: "Aprovação por mensagem solta se perde e gera dúvida depois.",
      howAruaUses: "Cada decisão fica com data, autor e origem; ajuste exige descrição.",
      whatIsReal: "O fluxo é o mesmo do sistema real. Nada é salvo.",
    },
    "ponto-de-partida": {
      represents: "O diagnóstico que mostrou onde o Tlim ajuda este tipo de negócio.",
      problem: "Mudar sem diagnóstico é investir no escuro.",
      howAruaUses: "Cada oportunidade vira um módulo do Tlim com prioridade combinada.",
      whatIsReal: "Indicadores e oportunidades de um caso real, sem identificar o restaurante.",
    },
  },
};

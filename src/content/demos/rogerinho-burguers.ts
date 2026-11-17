// Demonstração guiada da Central de Presença Digital — Rogerinho Burguer's.
// Fonte de verdade: documentação do projeto original (diagnóstico de 31/10/2026).
// Fontes, datas e o que ficou de fora estão em docs/demos/rogerinho-burguers.md.
// Não copiar nada do banco original, de arquivos de acesso nem de conversas.
import type { ClientDemo } from "./types";

const DIAGNOSIS_DATE = "2026-10-31";
const PROPOSAL_DATE = "2026-11-17";
const CAPTURES = "Capturas de tela dos perfis públicos em 31/10/2026";

export const rogerinhoBurguers: ClientDemo = {
  slug: "rogerinho-burguers",
  themeClass: "demo-theme-rogerinho",
  business: {
    name: "Rogerinho Burguer's",
    nameVariants: [
      { platform: "Instagram e Anota AI", name: "Rogerinho Burguer's" },
      { platform: "Google (em 31/10/2026)", name: "Rogerinho Burgue's" },
    ],
    segment: "Hamburgueria",
    location: "Av. Petrolina, Sagrada Família, Belo Horizonte/MG",
    addressNote:
      "O número difere entre as fontes: 225A no Google e 225 no Instagram e no Anota AI. Mantido sem número até a confirmação do proprietário.",
    instagramHandle: "@rogerinhoburguers",
    links: [
      {
        label: "Cardápio no Anota AI",
        url: "https://pedido.anota.ai/loja/rogerinhoburguers",
        note: "Canal de pedidos indicado na bio do Instagram.",
      },
      {
        label: "Instagram @rogerinhoburguers",
        url: "https://www.instagram.com/rogerinhoburguers/",
        note: "Perfil público da loja.",
      },
    ],
  },

  diagnosis: {
    date: DIAGNOSIS_DATE,
    source: `${CAPTURES} (Google, Google Maps, Instagram e Anota AI) e links indicados pelo gestor.`,
    summary:
      "A loja já tem reputação construída no Google, identidade visual marcante e um caminho de pedido funcionando. As oportunidades estão na consistência das informações entre os canais, na atualização do Instagram e no cardápio online.",
    projectStatus:
      "Proposta: piloto de 60 dias, de graça, para aprender juntos e colher resultados. Aguardando aprovação do proprietário; nenhum serviço aprovado registrado.",
    projectStatusDate: PROPOSAL_DATE,
    strengths: [
      {
        title: "Reputação já construída",
        description:
          "Nota 4,4 com 419 avaliações no Google: um ativo para proteger e manter ativo.",
        evidence: "Captura 01 — busca do Google",
      },
      {
        title: "Identidade visual marcante",
        description: "Mascote, vermelho forte e artes com a marca nos stories.",
        evidence: "Captura 04 — perfil do Instagram",
      },
      {
        title: "Caminho de pedido existe",
        description: "Link do Anota AI na bio do Instagram e botão “Pedir on-line” no Google.",
        evidence: "Captura 02 — Google Maps",
      },
      {
        title: "Clientes falam bem",
        description: "O destaque “Clientes” traz um depoimento espontâneo de cliente.",
        evidence: "Captura 06 — destaque “Clientes”",
      },
      {
        title: "Cardápio com descrições",
        description: "Lanches com ingredientes e preços claros no Anota AI.",
        evidence: "Captura 07 — categoria Lanches",
      },
    ],
    opportunities: [
      {
        title: "Nome com grafias diferentes",
        description:
          "“Rogerinho Burgue's” no Google; “Rogerinho Burguer's” no Anota AI e na bio do Instagram.",
        channel: "Google · Instagram · Anota AI",
        evidence: "Capturas 01, 02, 03 e 04",
        certainty: "verificado",
        recommendation:
          "Confirmar a grafia oficial com o proprietário e padronizar em todos os canais.",
      },
      {
        title: "Endereço com variação",
        description:
          "Google mostra o número 225A; Instagram e Anota AI mostram 225. O mapa do Anota AI aponta para o endereço, não para o perfil da empresa.",
        channel: "Google · Instagram · Anota AI",
        evidence: "Capturas 01, 02, 04, 10 e 12",
        certainty: "verificado",
        recommendation: "Confirmar o número correto e só então padronizar.",
      },
      {
        title: "Google sem site cadastrado",
        description: "O perfil exibia “Adicionar website” no momento do diagnóstico.",
        channel: "Perfil da Empresa no Google",
        evidence: "Captura 02",
        certainty: "verificado",
        recommendation:
          "Cadastrar o link do cardápio online no campo de site, com acesso e aprovação do proprietário.",
      },
      {
        title: "Destaques antigos no Instagram",
        description: "Promoções (170 semanas), Os preferidos! (176) e Clientes (342).",
        channel: "Instagram",
        evidence: "Capturas 04, 05 e 06",
        certainty: "verificado",
        recommendation:
          "Atualizar os destaques para quem chega ao perfil entender o que a loja vende e como pedir.",
      },
      {
        title: "Itens e categorias sem foto no Anota AI",
        description:
          "Item “Grande” nos Destaques e categoria Espaguetes (Pequeno e Grande) sem imagem; categorias sem foto de capa.",
        channel: "Anota AI",
        evidence: "Capturas 03, 08 e 09",
        certainty: "verificado",
        recommendation: "Adicionar fotos reais e descrições curtas, com autorização de uso.",
      },
      {
        title: "Dois caminhos de pedido sem orientação clara",
        description: "Os stories chamam para o WhatsApp; a bio leva ao Anota AI.",
        channel: "Instagram · WhatsApp · Anota AI",
        evidence: "Capturas 04 e 05",
        certainty: "verificado",
        recommendation: "Definir com o proprietário qual canal destacar em cada situação.",
      },
      {
        title: "Publicações antigas como referência",
        description:
          "As publicações de referência indicadas são de jun. a set./2021 (data aproximada, deduzida do código do link).",
        channel: "Instagram",
        evidence: "Três links de referência indicados pelo gestor",
        certainty: "verificado",
        recommendation: "Retomar os formatos com fotos e preços atuais.",
      },
      {
        title: "Bebidas marcadas como esgotadas",
        description: "Guaraná 1L e Mini Fanta apareciam como esgotados no momento da captura.",
        channel: "Anota AI",
        evidence: "Captura 11",
        certainty: "pendente",
        recommendation: "Confirmar se a situação era temporária antes de qualquer ação.",
      },
      {
        title: "Fotos de lanches possivelmente ilustrativas",
        description: "Algumas fotos de lanches no Anota AI parecem imagens de banco.",
        channel: "Anota AI",
        evidence: "Captura 07 (avaliação visual, não confirmada)",
        certainty: "hipotese",
        recommendation: "Confirmar com o proprietário e, se for o caso, usar fotos reais.",
      },
      {
        title: "Canais de pedido ativos",
        description:
          "Um levantamento anterior indicava Rappi desativado, e o iFood aparece na busca do Google.",
        channel: "Rappi · iFood",
        evidence: "Levantamento anterior e busca do Google",
        certainty: "hipotese",
        recommendation: "Confirmar quais canais de pedido estão ativos.",
      },
    ],
    missingInfo: [
      "Acesso ao painel profissional do Instagram (alcance, interações, toques no link).",
      "Acesso ao Perfil da Empresa no Google.",
      "Acesso ao painel do Anota AI (origem de acessos e pedidos).",
      "Datas de início e fim da parceria.",
      "Fotos próprias e autorização de uso.",
    ],
    referenceLinks: [
      {
        label: "Publicação de referência (≈ 29/06/2021)",
        url: "https://www.instagram.com/rogerinhoburguers/p/CQuXqY7h99f/",
      },
      {
        label: "Reels de referência (≈ 22/06/2021)",
        url: "https://www.instagram.com/rogerinhoburguers/reel/CQcKYrohuIv/",
      },
      {
        label: "Publicação de referência (≈ 22/09/2021)",
        url: "https://www.instagram.com/rogerinhoburguers/p/CUIP_XXLhjj/",
      },
    ],
  },

  indicators: [
    {
      id: "g_rating",
      channel: "Google",
      label: "Nota no Google",
      explain: "A nota de 1 a 5 que aparece para quem pesquisa a loja.",
      value: 4.4,
      decimals: 1,
      referenceDate: DIAGNOSIS_DATE,
      source: `${CAPTURES} — busca do Google e Google Maps (capturas 01 e 02)`,
      nature: "real",
    },
    {
      id: "g_reviews",
      channel: "Google",
      label: "Avaliações no Google",
      explain: "Quantas pessoas já avaliaram a loja no Google.",
      value: 419,
      referenceDate: DIAGNOSIS_DATE,
      source: `${CAPTURES} — busca do Google e Google Maps (capturas 01 e 02)`,
      nature: "real",
    },
    {
      id: "ig_followers",
      channel: "Instagram",
      label: "Seguidores no Instagram",
      explain: "Pessoas que acompanham o perfil. Seguidor não é alcance.",
      value: 1188,
      referenceDate: DIAGNOSIS_DATE,
      source: `${CAPTURES} — perfil do Instagram (captura 04)`,
      nature: "real",
    },
    {
      id: "ig_posts",
      channel: "Instagram",
      label: "Publicações no Instagram",
      explain: "Total de posts visíveis no feed do perfil.",
      value: 69,
      referenceDate: DIAGNOSIS_DATE,
      source: `${CAPTURES} — perfil do Instagram (captura 04)`,
      nature: "real",
    },
    {
      id: "ig_reach",
      channel: "Instagram",
      label: "Alcance",
      explain: "Contas que tiveram contato com os conteúdos da loja.",
      value: null,
      referenceDate: null,
      source: "Painel profissional do Instagram (Insights)",
      nature: null,
      unavailableReason: "Sem acesso ao painel profissional na data do diagnóstico.",
    },
    {
      id: "ig_impressions",
      channel: "Instagram",
      label: "Visualizações",
      explain: "Quantas vezes os conteúdos apareceram na tela.",
      value: null,
      referenceDate: null,
      source: "Painel profissional do Instagram (Insights)",
      nature: null,
      unavailableReason: "Sem acesso ao painel profissional na data do diagnóstico.",
    },
    {
      id: "ig_profile_visits",
      channel: "Instagram",
      label: "Visitas ao perfil",
      explain: "Quantas vezes o perfil foi aberto no período.",
      value: null,
      referenceDate: null,
      source: "Painel profissional do Instagram (Insights)",
      nature: null,
      unavailableReason: "Sem acesso ao painel profissional na data do diagnóstico.",
    },
    {
      id: "anota_clicks",
      channel: "Instagram · Anota AI",
      label: "Toques no link do cardápio",
      explain: "Toques no link da bio que leva ao cardápio. Toque não é pedido.",
      value: null,
      referenceDate: null,
      source: "Insights do Instagram › Atividade do perfil",
      nature: null,
      unavailableReason: "Sem acesso ao painel profissional na data do diagnóstico.",
    },
    {
      id: "anota_orders",
      channel: "Anota AI",
      label: "Pedidos com origem identificada",
      explain: "Só quando o Anota AI informar de onde veio o pedido. Não estimamos este número.",
      value: null,
      referenceDate: null,
      source: "Painel do Anota AI",
      nature: null,
      unavailableReason: "Sem acesso ao painel do Anota AI na data do diagnóstico.",
    },
  ],

  activitiesNote:
    "Plano de 2 meses registrado na Central original em 31/10/2026: 1 atividade em andamento e 18 planejadas. Nenhuma atividade aparece como concluída, porque a conclusão exige evidência.",
  activities: [
    {
      month: 1,
      category: "Estratégia e planejamento",
      title: "Diagnóstico inicial da presença digital",
      description:
        "Levantamento do perfil no Google, Instagram e cardápio no Anota AI, com capturas de tela de cada canal.",
      objective:
        "Entender o ponto de partida da loja e listar oportunidades reais, sem suposições.",
      status: "andamento",
      evidence: [
        "12 capturas de tela dos perfis públicos (31/10/2026)",
        "5 links de referência (cardápio, perfil e 3 publicações)",
      ],
    },
    {
      month: 1,
      category: "Google",
      title: "Padronizar nome, endereço e horário nos canais",
      description:
        "Nome e número do endereço aparecem diferentes entre Google, Instagram e Anota AI.",
      objective: "O cliente encontrar a mesma loja, com as mesmas informações, em qualquer canal.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 1,
      category: "Estratégia e planejamento",
      title: "Calendário de conteúdo do mês 1",
      description: "Definir temas, dias de publicação e formatos (feed, stories, destaques).",
      objective: "Dar regularidade à comunicação e evitar publicações soltas.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 1,
      category: "Instagram",
      title: "Organizar destaques e bio do Instagram",
      description: "Atualizar os destaques (de 170 a 342 semanas) e revisar a bio.",
      objective: "Quem chega ao perfil entender rápido o que a loja vende e como pedir.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 1,
      category: "Criação de conteúdo",
      title: "Primeiros materiais: posts e stories",
      description:
        "Produzir as primeiras peças com fotos reais autorizadas e enviar para aprovação.",
      objective: "Apresentar os produtos de forma atrativa e com chamada clara para o pedido.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 1,
      category: "Engajamento",
      title: "Estratégia de engajamento: enquetes e caixinhas",
      description: "Stories com enquetes e perguntas sobre preferências do público.",
      objective: "Criar oportunidades de interação e conhecer melhor os clientes.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 1,
      category: "Pesquisa de satisfação",
      title: "Primeira pesquisa rápida pelo WhatsApp",
      description: "Até 3 perguntas, enviadas pela própria loja a clientes que já pediram.",
      objective: "Ouvir o cliente e descobrir o que valorizar e o que melhorar.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 1,
      category: "Google",
      title: "Estruturar o pedido de avaliações no Google",
      description:
        "Mensagem padrão e momento certo para convidar o cliente a avaliar, sem oferecer benefícios em troca.",
      objective: "Manter a reputação ativa com avaliações recentes e espontâneas.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 1,
      category: "Anota AI",
      title: "Organizar o caminho até o Anota AI",
      description:
        "Revisar o link da bio, incluir o link no campo de site do Google e padronizar as chamadas para pedido.",
      objective: "Reduzir os passos entre descobrir a loja e fazer o pedido.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 1,
      category: "Anota AI",
      title: "Revisar fotos e itens do cardápio online",
      description: "Itens e categorias sem foto ou sem imagem de capa.",
      objective: "Um cardápio com fotos e descrições completas ajuda o cliente a decidir.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 1,
      category: "WhatsApp",
      title: "Mensagens padrão para o WhatsApp da loja",
      description: "Respostas rápidas para saudação, cardápio, horário e link de pedido.",
      objective: "Atender com agilidade e sempre direcionar para o canal de pedido.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 2,
      category: "Instagram",
      title: "Continuidade das publicações",
      description: "Seguir o calendário do mês 2 com base no que funcionou no mês 1.",
      objective: "Manter a loja presente e lembrada.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 2,
      category: "Estratégia e planejamento",
      title: "Análise do desempenho dos conteúdos",
      description: "Comparar alcance, interações e toques no link de cada conteúdo publicado.",
      objective: "Entender quais conteúdos conectam mais com o público.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 2,
      category: "Estratégia e planejamento",
      title: "Ajustes de comunicação",
      description: "Ajustar formatos, horários e chamadas a partir da análise.",
      objective: "Melhorar continuamente a comunicação.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 2,
      category: "Engajamento",
      title: "Novas interações com clientes",
      description:
        "Novas enquetes, repost de clientes (com autorização) e respostas a comentários.",
      objective: "Fortalecer o relacionamento com quem já conhece a loja.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 2,
      category: "Google",
      title: "Incentivo contínuo às avaliações",
      description: "Manter o convite para avaliar e responder às avaliações recebidas.",
      objective: "Fortalecer a confiança de quem pesquisa a loja no Google.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 2,
      category: "Criação de conteúdo",
      title: "Conteúdos baseados nas pesquisas",
      description: "Transformar as respostas da pesquisa em temas de conteúdo.",
      objective: "Falar do que o cliente realmente valoriza.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 2,
      category: "Anota AI",
      title: "Otimização dos direcionamentos para pedido",
      description: "Revisar chamadas e links conforme os dados de acesso disponíveis.",
      objective: "Facilitar ainda mais o caminho até o pedido.",
      status: "planejado",
      evidence: [],
    },
    {
      month: 2,
      category: "Estratégia e planejamento",
      title: "Consolidação da documentação e relatório final",
      description:
        "Reunir histórico, aprovações, indicadores e recomendações para a próxima etapa.",
      objective: "Deixar uma base organizada que continua útil depois da parceria.",
      status: "planejado",
      evidence: [],
    },
  ],

  publications: {
    intro:
      "Aqui a Aruá organiza o que será publicado, em que canal, com qual objetivo e em que situação cada peça está.",
    realPublications: [],
    noRealPublicationsNote:
      "Nenhuma publicação foi feita pela Aruá até a data do diagnóstico. Quando houver, cada uma aparece aqui com data e link da publicação.",
    concepts: [
      {
        title: "Enquete: qual é o seu preferido?",
        format: "Stories com figurinha de enquete",
        channel: "Instagram",
        goal: "Engajamento e conhecer as preferências do público",
        caption: "Qual é o seu preferido? X-Tudo | Espaguete na Chapa",
        nature: "simulacao",
      },
      {
        title: "Post de interação",
        format: "Feed (legenda)",
        channel: "Instagram",
        goal: "Conversa nos comentários e chamada para o cardápio",
        caption:
          "Time X-Tudo ou time Espaguete na Chapa? Conta aqui nos comentários! E se bateu a fome, o cardápio está no link da bio.",
        nature: "simulacao",
      },
      {
        title: "Caixinha de perguntas",
        format: "Stories com caixinha",
        channel: "Instagram",
        goal: "Ideias de conteúdo a partir do público (repost só com autorização)",
        caption: "Qual lanche você quer ver em promoção?",
        nature: "simulacao",
      },
    ],
    calendarPrinciples: [
      "Peças com fotos reais e autorizadas; sem imagem de banco apresentada como produto da loja.",
      "Toda peça passa por aprovação do proprietário antes de ir ao ar.",
      "Cada publicação registrada com data, canal e link, para servir de evidência.",
      "Chamada clara para o canal de pedido definido com o proprietário.",
    ],
  },

  approvals: {
    intro:
      "Nenhum material vai ao ar sem a decisão do proprietário. Cada decisão fica registrada com data, autor e origem. Teste abaixo o mesmo fluxo da Central da loja.",
    steps: [
      { title: "Material preparado", detail: "A Aruá produz a peça e descreve objetivo e canal." },
      {
        title: "Enviado ao cliente",
        detail: "O material aparece na área de aprovações do cliente.",
      },
      { title: "Cliente avalia", detail: "O proprietário vê a peça pelo celular, com contexto." },
      {
        title: "Aprova ou pede ajustes",
        detail: "Pedido de ajuste exige descrição do que mudar.",
      },
      {
        title: "Gestor registra a decisão",
        detail: "Decisões combinadas pelo WhatsApp entram com evidência e marcadas como tal.",
      },
    ],
    recordedApprovals: 0,
    recordedNote:
      "Aprovações registradas na Central original até 31/10/2026: nenhuma. O trabalho ainda estava em fase de proposta.",
    sample: {
      title: "Stories: enquete “Qual é o seu preferido?”",
      channel: "Instagram",
      description:
        "Exemplo de como um material chega para avaliação. Não foi enviado ao proprietário nem publicado.",
    },
  },

  relationship: {
    rules: [
      "Convidar todos os clientes a avaliar, não apenas os que parecem satisfeitos.",
      "Nunca oferecer desconto, brinde ou vantagem em troca de avaliação.",
      "Pedir uma opinião sincera, sem sugerir a nota.",
      "Responder todas as avaliações, inclusive as críticas, com educação.",
      "Melhor momento: logo depois que o pedido chega.",
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
        "Enviada manualmente pela própria loja a quem já pediu. As respostas são registradas sem nome nem telefone do cliente.",
    },
    reviewScripts: [
      {
        heading: "Convite após o pedido (WhatsApp)",
        text: "Esperamos que tenha curtido seu pedido! Se puder, conta como foi lá no Google — sua opinião sincera ajuda outras pessoas a conhecerem a gente.",
      },
      {
        heading: "Cartão no balcão ou na embalagem",
        text: "Gostou? Conta pra gente no Google! [QR code para avaliação]",
      },
      {
        heading: "Resposta a avaliação com crítica",
        text: "Obrigado por contar. Sentimos muito pela experiência. Queremos entender melhor e resolver: fale com a gente pelo WhatsApp da loja.",
      },
    ],
    responsesNote:
      "Respostas de pesquisa registradas até 31/10/2026: nenhuma. Médias e sugestões aparecem aqui só depois das primeiras respostas reais.",
  },

  nextActions: [
    {
      title: "Levantamento dos perfis públicos",
      detail: "Google, Google Maps, Instagram e Anota AI registrados em capturas de tela.",
      state: "realizada",
      evidence: "12 capturas de tela de 31/10/2026, guardadas no acervo do projeto.",
    },
    {
      title: "Grafia oficial do nome",
      detail: "Burguer's ou Burgue's?",
      state: "aguardando-confirmacao",
    },
    {
      title: "Número do endereço",
      detail: "225 ou 225A?",
      state: "aguardando-confirmacao",
    },
    {
      title: "Canal de pedido a destacar",
      detail: "Anota AI ou WhatsApp, e em que situação.",
      state: "aguardando-confirmacao",
    },
    {
      title: "Bebidas esgotadas e canais ativos",
      detail: "Confirmar se o esgotado era temporário e se iFood e Rappi estão ativos.",
      state: "aguardando-confirmacao",
    },
    {
      title: "Acesso aos painéis",
      detail: "Insights do Instagram, Perfil da Empresa no Google e painel do Anota AI.",
      state: "depende-acesso",
    },
    {
      title: "Fotos próprias da loja",
      detail: "Fotos recentes dos lanches e espaguetes, com autorização de uso.",
      state: "depende-autorizacao",
    },
    {
      title: "Aprovação do piloto gratuito de 60 dias",
      detail: "Datas de início e fim do piloto, aprovadas pelo proprietário.",
      state: "depende-autorizacao",
    },
    {
      title: "Cadastrar o cardápio como site no Google",
      detail: "Depende de acesso ao Perfil da Empresa e da aprovação do proprietário.",
      state: "proposta",
    },
    {
      title: "Link da bio com origem identificável",
      detail: "Avaliar um link com utm_source=instagram, se o painel do Anota AI mostrar a origem.",
      state: "proposta",
    },
  ],

  strategy: {
    positioning:
      "O objetivo não é só postar. É a loja estar mais presente, ser mais conhecida e ter mais chances de se conectar com quem pede. O serviço não promete números.",
    pillars: [
      {
        title: "Visibilidade",
        items: ["Planejamento de publicações", "Conteúdo para Instagram", "Stories recorrentes"],
      },
      {
        title: "Relacionamento",
        items: ["Pesquisas de satisfação", "Enquetes interativas", "Conteúdo a partir do público"],
      },
      {
        title: "Reputação",
        items: ["Estratégia de avaliações no Google", "Feedback espontâneo", "Confiança"],
      },
      {
        title: "Conversão",
        items: ["Instagram → Anota AI", "Chamadas para ação", "Facilitar o pedido"],
      },
      {
        title: "Gestão e evolução",
        items: ["Acompanhamento", "Aprovações registradas", "Análise de indicadores"],
      },
    ],
    months: [
      {
        title: "Mês 1 · Organização e estruturação",
        description: "Organizar a comunicação e estabelecer uma presença digital mais consistente.",
      },
      {
        title: "Mês 2 · Consolidação e otimização",
        description: "Dar continuidade, identificar oportunidades e melhorar a comunicação.",
      },
    ],
    measurement: [
      "Seguidor não é alcance, curtida não é venda, clique não é pedido.",
      "Medir sempre no mesmo período e do mesmo jeito, com print da fonte.",
      "Indicadores são complementares e nunca atribuídos automaticamente ao trabalho.",
      "Pedidos só são contados se o Anota AI informar a origem.",
    ],
    lasting: [
      "Comunicação digital mais organizada",
      "Histórico de conteúdos e estratégias",
      "Mais conhecimento sobre as preferências dos clientes",
      "Processo estruturado para pedir avaliações",
      "Caminho mais claro entre conhecer o produto e pedir",
    ],
    continuity: [
      { title: "Calendário contínuo de conteúdo", description: "Manter a regularidade." },
      { title: "Campanhas temáticas", description: "Datas especiais, lançamentos e combos." },
      { title: "Fidelização", description: "Fazer quem já pediu voltar a pedir." },
      { title: "Reputação no Google", description: "Responder e incentivar avaliações." },
      { title: "Análise periódica", description: "Leitura mensal da presença digital." },
    ],
    proposalValue: "De graça",
    proposalPurpose:
      "Um piloto de 60 dias para aprender juntos e colher resultados. Ao final, olhamos o que o período mostrou e decidimos juntos os próximos passos.",
    proposalStatus:
      "Proposta apresentada em 17/11/2026, aguardando aprovação do proprietário. As datas do piloto dependem dessa aprovação.",
  },

  guide: {
    "visao-geral": {
      represents: "O resumo que o proprietário abre pelo celular para saber como está a parceria.",
      problem: "Sem um lugar único, o andamento fica espalhado em conversas e prints.",
      howAruaUses:
        "Abrimos cada conversa de acompanhamento por aqui: situação, pendências e próximos passos.",
      whatIsReal: "Identificação da loja, indicadores do marco inicial e situação da proposta.",
    },
    diagnostico: {
      represents: "O ponto de partida da loja em cada canal, com a evidência de cada achado.",
      problem: "Recomendações sem evidência viram opinião; com evidência, viram decisão.",
      howAruaUses: "Cada oportunidade tem fonte e grau de certeza antes de virar atividade.",
      whatIsReal:
        "Todos os achados vêm das capturas de 31/10/2026. Hipóteses e pendências estão marcadas.",
    },
    atividades: {
      represents: "O plano de 2 meses, atividade por atividade, com status e evidências.",
      problem: "Sem plano visível, o cliente não sabe o que está sendo feito nem por quê.",
      howAruaUses: "Nenhuma atividade é marcada como concluída sem evidência registrada.",
      whatIsReal: "O plano e os status registrados na Central original em 31/10/2026.",
    },
    "presenca-digital": {
      represents: "Os indicadores da loja, cada um com valor, data, fonte e natureza.",
      problem: "Número sem fonte e sem data não permite comparar nem prestar contas.",
      howAruaUses:
        "Registramos a mesma medição, do mesmo jeito, a cada período. Sem série real, não há gráfico de evolução.",
      whatIsReal:
        "Os quatro números do marco inicial, observados em 31/10/2026. Não são resultados da Aruá.",
    },
    publicacoes: {
      represents: "A organização dos conteúdos: o que vai ao ar, onde, para quê e em que fase.",
      problem: "Publicações soltas não constroem presença; sem registro, não há como avaliar.",
      howAruaUses: "Cada peça nasce com objetivo e canal, passa por aprovação e é registrada.",
      whatIsReal:
        "Nenhuma publicação da Aruá até a data do diagnóstico. Os cartões são exemplos conceituais.",
    },
    aprovacoes: {
      represents: "Como o proprietário decide sobre cada material antes de ir ao ar.",
      problem: "Aprovação por mensagem solta se perde e gera dúvida depois.",
      howAruaUses:
        "Cada decisão fica com data, autor e origem; pedidos de ajuste exigem descrição.",
      whatIsReal: "O fluxo é o da Central original. Nenhuma aprovação foi registrada até 31/10.",
    },
    "pesquisas-e-avaliacoes": {
      represents: "A estratégia para ouvir clientes e manter a reputação no Google ativa.",
      problem: "Pedir avaliação só a quem gostou, ou oferecer vantagem, viola as regras do Google.",
      howAruaUses: "A loja envia; as respostas entram sem nome nem telefone do cliente.",
      whatIsReal: "As regras e os roteiros documentados no projeto. Nenhuma resposta registrada.",
    },
    "proximas-acoes": {
      represents: "O que falta decidir, confirmar ou liberar para o trabalho andar.",
      problem: "Pendência sem dono e sem tipo trava o projeto sem ninguém perceber.",
      howAruaUses:
        "Separamos o que é proposta, o que espera confirmação e o que depende de acesso.",
      whatIsReal: "As perguntas e dependências documentadas no diagnóstico.",
    },
    "proposta-e-estrategia": {
      represents:
        "A proposta da Aruá (piloto gratuito), os pilares do trabalho e a lógica do acompanhamento.",
      problem: "Sem estratégia explícita, o cliente compara só preço e quantidade de posts.",
      howAruaUses: "Apresentamos os pilares e decidimos a continuidade com base no período.",
      whatIsReal:
        "Pilares e plano por mês vêm do diagnóstico de 31/10/2026. O valor (de graça) é o da proposta apresentada em 17/11/2026.",
    },
  },
};

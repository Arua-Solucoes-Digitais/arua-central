// =====================================================================
// TEXTOS DO SITE DA ARUÁ — edite aqui para mudar o conteúdo das páginas.
// Itens marcados com "A DEFINIR" ainda precisam do texto real da Aruá.
// Itens marcados com "A CONFERIR" foram montados a partir do mapa mental; confirme antes de publicar.
// Regra da marca: nada de números, clientes ou depoimentos inventados.
// Projetos, sistemas no ar e depoimentos vêm do banco (Área restrita), não daqui.
// =====================================================================

// Valores ainda não divulgados (decisão de 17/11/2026): no lugar de qualquer preço, "Em breve".
export const COMING_SOON = "Em breve";

export const navigation = {
  menuLabel: "Abrir menu",
  title: "Menu",
  items: [
    { href: "/", label: "Início" },
    { href: "/servicos", label: "Serviços" },
    { href: "/planos", label: "Planos" },
    { href: "/aplicacoes", label: "Aplicações personalizadas" },
    { href: "/portfolio", label: "Portfólio" },
    { href: "/suporte", label: "Suporte" },
    { href: "/area-do-cliente", label: "Área do cliente" },
    { href: "/#contato", label: "Contato" },
  ],
  restricted: "Área restrita",
  cta: "Solicitar orçamento",
};

// Botão flutuante de contato (aparece depois de rolar a página e some perto do formulário).
// Com WhatsApp preenchido em contactInfo, abre a conversa; sem ele, leva ao formulário.
export const floatingContact = {
  whatsappLabel: "Conversar no WhatsApp",
  whatsappMessage: "Olá! Vim pelo site da Aruá e quero conversar sobre um projeto.",
  quoteLabel: "Pedir orçamento",
};

export const brand = {
  name: "Aruá",
  subtitle: "Soluções Digitais",
  slogan: "Inovação com harmonia, soluções com propósito.",
  tagline: "Tecnologia que conecta pessoas e possibilidades",
};

// Contato direto. Campos vazios não aparecem no site.
export const contactInfo = {
  whatsapp: "5538999636208", // WhatsApp comercial da Aruá (confirmado em 26/11/2026)
  email: "", // A DEFINIR: exemplo contato@arua.com.br
  address: "", // A DEFINIR: cidade/UF ou endereço comercial
  instagram: "arua.digital", // usuário sem @
  facebook: "https://www.facebook.com/profile.php?id=61596624517496",
  hours: "", // A DEFINIR: exemplo "Segunda a sexta, das 9h às 18h"
};

// Faixa escura com os valores da marca (vindos da apresentação de marca).
export const values = {
  title: "Transformando ideias",
  titleHighlight: "em soluções reais.",
  text: "Aruá é uma marca de tecnologia brasileira, criada para desenvolver soluções digitais, com foco em inovação, segurança e performance.",
  items: [
    { icon: "shield", title: "Segurança", subtitle: "em primeiro lugar" },
    { icon: "rocket", title: "Inovação", subtitle: "contínua" },
    { icon: "handshake", title: "Parceria", subtitle: "de verdade" },
    { icon: "gem", title: "Qualidade", subtitle: "em cada detalhe" },
  ],
};

export const hero = {
  eyebrow: "Aruá Soluções Digitais",
  title: "Seu negócio fácil de encontrar e fácil de comprar.",
  subtitle:
    "Sites, catálogos com pedido pelo WhatsApp e redes sociais para o comércio local. Você fala direto com quem desenvolve.",
  primaryCta: "Falar com a Aruá",
  secondaryCta: "Ver demonstrações",
};

export const pains = {
  title: "Reconhece alguma dessas?",
  items: [
    "O cliente pergunta o preço e espera pela resposta.",
    "O pedido chega pela metade e vira uma conversa longa.",
    "O perfil fica semanas parado.",
    "Quem comprou uma vez nunca mais é lembrado.",
  ],
};

export type Item = { title: string; description: string };
export type ServiceGroup = {
  id: string;
  icon: string;
  title: string;
  description: string;
  items: string[];
};

export const services: { title: string; intro: string; more: string; groups: ServiceGroup[] } = {
  title: "Serviços",
  intro: "Tudo o que sua empresa precisa para existir, aparecer e vender no digital.",
  more: "Ver todos os serviços",
  groups: [
    {
      id: "sites",
      icon: "code",
      title: "Sites e aplicações",
      description:
        "Sua empresa na internet, com página própria e ferramentas que facilitam o dia a dia.",
      items: ["Sites institucionais", "Lojas virtuais", "Aplicações personalizadas"],
    },
    {
      id: "social",
      icon: "megaphone",
      title: "Social media",
      description: "Redes sociais ativas e com estratégia, para atrair e manter clientes.",
      items: ["Gestão de redes", "Produção de conteúdo", "Campanhas de anúncios"],
    },
    {
      id: "audiovisual",
      icon: "camera",
      title: "Produção audiovisual",
      description:
        "Imagens que mostram seu negócio como ele é, prontas para o site e para as redes.",
      items: ["Fotos e vídeos", "Reels e edição"],
    },
    {
      id: "manutencao",
      icon: "wrench",
      title: "Manutenção e suporte",
      description: "Seu site e seus sistemas no ar, seguros e atualizados, sem você se preocupar.",
      items: ["Atualizações", "Hospedagem", "Monitoramento"],
    },
  ],
};

// Os projetos em si são cadastrados na Área restrita (/admin), não aqui.
export const baseProjects = {
  title: "Produtos Aruá",
  intro: "Soluções prontas da Aruá que você pode conhecer funcionando de verdade.",
  demoCta: "Ver demonstração",
  liveCta: "Abrir sistema ao vivo",
  detailsCta: "Conhecer o projeto",
  allCta: "Ver todo o portfólio",
  empty: "Em breve, novos projetos por aqui.",
  page: {
    back: "Voltar para o portfólio",
    client: "Cliente",
    problem: "O problema que resolve",
    features: "Principais funcionalidades",
    results: "Resultados",
    live: "Funcionando ao vivo",
    testimonials: "O que dizem",
    contactTitle: "Quer usar no seu negócio?",
    contactText:
      "Conte como você trabalha hoje e vemos juntos se esta solução faz sentido para você.",
    contactCta: "Falar com a Aruá",
    previewNotice:
      "Pré-visualização: esta página ainda não está publicada, e só quem está conectado ao painel consegue vê-la.",
  },
};

// Valores informados pela Aruá no mapa mental. Preço sempre "a partir de" quando depende do escopo.
export type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  summary: string;
  includes: string[];
};

export const plans: {
  title: string;
  intro: string;
  note: string;
  more: string;
  cta: string;
  items: Plan[];
  comparison: { title: string; rows: { label: string; plans: boolean[] }[] };
} = {
  title: "Planos",
  intro:
    "Escolha o tamanho certo para o momento da sua empresa. Você pode mudar de plano quando precisar.", // A CONFERIR: troca de plano a qualquer momento
  note: "Valores em breve. A criação de site ou aplicação sob medida é orçada à parte.",
  more: "Comparar planos",
  cta: "Quero este plano",
  // A CONFERIR: o que cada plano inclui foi montado a partir dos nomes do mapa mental.
  items: [
    {
      id: "presenca",
      name: "Presença Digital",
      price: COMING_SOON,
      period: "",
      summary: "Para estar na internet com um site profissional, seguro e sempre no ar.",
      includes: [
        "Site no ar com hospedagem",
        "Certificado de segurança (SSL) e cópias de segurança",
        "Atualizações e correções",
        "Suporte por WhatsApp",
      ],
    },
    {
      id: "social",
      name: "Digital + Social",
      price: COMING_SOON,
      period: "",
      summary: "O site mais as redes sociais cuidadas por quem entende.",
      includes: ["Tudo do Presença Digital", "Gestão das redes sociais", "Produção de conteúdo"],
    },
    {
      id: "profissional",
      name: "Digital Profissional",
      price: COMING_SOON,
      period: "",
      summary: "Conteúdo com fotos e vídeos próprios e relatórios para acompanhar.",
      includes: [
        "Tudo do Digital + Social",
        "Fotos e vídeos do seu negócio",
        "Reels e edição",
        "Relatório mensal de resultados",
      ],
    },
    {
      id: "performance",
      name: "Digital Performance",
      price: COMING_SOON,
      period: "",
      summary: "Para crescer com anúncios, métricas e acompanhamento estratégico.",
      includes: [
        "Tudo do Digital Profissional",
        "Gestão de campanhas de anúncios",
        "Acompanhamento de performance",
        "Reunião estratégica trimestral",
      ],
    },
  ],
  comparison: {
    title: "Comparativo de planos",
    rows: [
      { label: "Site no ar com hospedagem e SSL", plans: [true, true, true, true] },
      { label: "Atualizações, correções e monitoramento", plans: [true, true, true, true] },
      { label: "Suporte por WhatsApp", plans: [true, true, true, true] },
      { label: "Gestão das redes sociais", plans: [false, true, true, true] },
      { label: "Produção de conteúdo", plans: [false, true, true, true] },
      { label: "Fotos, vídeos e reels", plans: [false, false, true, true] },
      { label: "Relatório mensal de resultados", plans: [false, false, true, true] },
      { label: "Gestão de campanhas de anúncios", plans: [false, false, false, true] },
      { label: "Reunião estratégica trimestral", plans: [false, false, false, true] },
    ],
  },
};

export const pricing = {
  title: "Modelo comercial",
  intro:
    "Transparente desde o primeiro contato: um valor para criar e um valor mensal para manter e crescer. Os valores serão divulgados em breve.",
  groups: [
    {
      title: "Desenvolvimento inicial",
      items: ["Site ou aplicação sob medida (pagamento único)"],
    },
    {
      title: "Planos mensais",
      items: [
        "Presença digital",
        "Manutenção de sistemas sob medida",
        "Social media",
        "Planos completos, com conteúdo próprio e anúncios",
      ],
    },
    {
      title: "Serviços extras (orçados à parte)",
      items: [
        "Verba de anúncios, paga direto à plataforma",
        "Integrações com outros sistemas",
        "Funcionalidades especiais",
      ],
    },
  ],
};

export const faq: { title: string; items: { q: string; a: string }[] } = {
  title: "Perguntas frequentes",
  items: [
    {
      q: "Quanto tempo leva para meu site ficar pronto?",
      a: "Depende do tamanho do projeto. O prazo vai por escrito na proposta, antes de você aprovar.",
    },
    {
      q: "Emite nota fiscal ou substitui meu caixa?",
      a: "Não. As soluções cuidam da divulgação e do pedido. Seu sistema fiscal continua o mesmo.",
    },
    {
      q: "Recebe pagamento pelo site?",
      a: "Hoje não. O pagamento é combinado direto entre você e seu cliente.",
    },
    {
      q: "O Tlim já está disponível?",
      a: "Ainda não. O que está no site é uma demonstração, com restaurante fictício e dados simulados.",
    },
    {
      q: "O valor do plano inclui a criação do site?",
      a: "Os planos cobrem manter, atualizar e divulgar. A criação de site ou aplicação sob medida é orçada à parte.", // A CONFERIR
    },
    {
      q: "A verba dos anúncios está incluída?",
      a: "Não. A Aruá cuida das campanhas; o valor investido nos anúncios é pago direto à plataforma, como Meta ou Google.", // A CONFERIR
    },
    {
      q: "Meus dados e os dos meus clientes ficam seguros?",
      a: "O site usa conexão segura (HTTPS). A proposta informa onde os dados ficam, quem tem acesso e como são feitas as cópias, de acordo com a LGPD.",
    },
    {
      q: "Posso ver um sistema da Aruá funcionando antes de contratar?",
      a: "Pode. No portfólio há demonstrações que você abre no celular, no tablet ou no computador.",
    },
  ],
};

// Aplicações personalizadas (sistemas sob medida).
export const customApps = {
  title: "Aplicações personalizadas",
  intro: "Sistemas feitos para o jeito que o seu negócio funciona, e não o contrário.",
  examplesTitle: "Exemplos de uso",
  examples: [
    {
      icon: "utensils",
      title: "Restaurantes e lanchonetes",
      description: "Cardápio digital, pedidos organizados e envio direto para o WhatsApp.",
    },
    {
      icon: "store",
      title: "Lojas",
      description: "Catálogo de produtos, pedidos e acompanhamento de vendas.",
    },
    {
      icon: "bed",
      title: "Hospedagens",
      description: "Vitrine com fotos, modalidades e pedidos de reserva completos.",
    },
    {
      icon: "calendar",
      title: "Prestadores de serviço",
      description: "Agendamentos, lembretes e organização de clientes.",
    },
  ],
  featuresTitle: "Funcionalidades",
  features: [
    "Pedidos e reservas pelo site",
    "Agendamentos",
    "Catálogo e cardápio digital",
    "Integração com WhatsApp",
    "Painel para você editar tudo sem mexer em código",
    "Relatórios de acesso e de vendas",
  ],
  salesTitle: "Processo de venda",
  sales: [
    {
      title: "Conversa",
      description: "Entendemos como você trabalha hoje e o que precisa resolver.",
    },
    { title: "Demonstração", description: "Você vê um sistema parecido funcionando ao vivo." },
    { title: "Proposta", description: "Escopo, prazo e valor por escrito, sem surpresa." },
    { title: "Aprovação", description: "Com a proposta aprovada, começamos a implantação." },
  ],
  cta: "Quero um sistema sob medida",
};

// Processo de implantação (antes "Como trabalhamos").
export const process: { title: string; intro: string; deadline: string; steps: Item[] } = {
  title: "Processo de implantação",
  intro: "Um caminho simples e transparente, da proposta aprovada ao sistema no ar.",
  deadline: "O prazo de cada projeto vai por escrito na proposta.",
  steps: [
    {
      title: "Aprovação da proposta",
      description: "Escopo, etapas e prazo definidos por escrito.",
    },
    { title: "Desenvolvimento", description: "Construímos a solução com acompanhamento próximo." },
    {
      title: "Configurações e testes",
      description: "Tudo conferido antes de chegar ao seu cliente.",
    },
    { title: "Treinamento", description: "Você aprende a usar e a editar o que precisar." },
    { title: "Publicação", description: "No ar, com hospedagem, segurança e monitoramento." },
  ],
};

export const technical = {
  title: "Estrutura técnica",
  intro: "Tecnologia atual, segura e preparada para crescer junto com o seu negócio.",
  items: [
    { icon: "code", title: "Tecnologias", description: "React, TypeScript e Node.js." },
    {
      icon: "database",
      title: "Banco de dados",
      description: "SQLite ou PostgreSQL, conforme o tamanho do sistema.",
    },
    {
      icon: "shield",
      title: "Segurança",
      description: "Conexão segura (HTTPS), acesso restrito e cuidado com dados conforme a LGPD.",
    },
    {
      icon: "server",
      title: "Hospedagem",
      description: "Em nuvem, escolhida conforme o tamanho de cada projeto.",
    },
    {
      icon: "trending",
      title: "Escalabilidade",
      description: "Estrutura que cresce sem precisar refazer tudo.",
    },
  ],
};

export const management = {
  title: "Gestão e resultados",
  intro: "Você acompanha o que o digital está trazendo para o seu negócio.",
  items: [
    "Relatórios de acesso",
    "Relatórios de vendas",
    "Métricas de social media",
    "Acompanhamento de performance",
  ],
};

export const evolution = {
  title: "Manutenção e evolução",
  intro: "Depois de publicado, seguimos juntos para manter e melhorar.",
  items: [
    "Atualizações contínuas",
    "Correções de bugs",
    "Suporte técnico",
    "Novas funcionalidades",
    "Reuniões estratégicas trimestrais",
  ],
};

export const portfolio = {
  title: "Portfólio",
  intro:
    "Projetos da Aruá e trabalhos para clientes. Os que estão hospedados conosco você pode abrir e usar ao vivo.",
  all: "Todos",
  categories: {
    site: "Sites",
    aplicacao: "Aplicações",
    sistema: "Sistemas",
    social: "Social media",
    audiovisual: "Produção audiovisual",
  },
  kinds: { product: "Produto Aruá", case: "Case de cliente" },
  empty: "Nenhum projeto nesta categoria ainda.",
  testimonialsTitle: "Resultados e depoimentos",
  testimonialsEmpty: "",
};

// Situação dos sistemas, calculada pela verificação automática (npm run status).
export const liveStates = {
  planned: "Em preparação",
  maintenance: "Em manutenção",
  unchecked: "Aguardando verificação",
  online: "No ar",
  offline: "Fora do ar",
};

export const environments = {
  production: "Produção",
  demo: "Demonstração",
  staging: "Homologação",
};

export const status = {
  title: "Status dos sistemas",
  intro: "Situação dos sistemas hospedados pela Aruá, verificada automaticamente.",
  empty: "Nenhum sistema publicado ainda.",
  lastCheck: "Última verificação",
  uptime: "Disponibilidade em 30 dias",
  never: "ainda não verificado",
  open: "Abrir",
};

export const support = {
  title: "Suporte",
  intro: "Ajuda rápida para quem já é cliente e para quem quer conhecer.",
  helpTitle: "Central de ajuda",
  tutorialsTitle: "Tutoriais e manuais",
  // A DEFINIR: acrescente tutoriais quando existirem, como { title, url }. Vazio, a seção não aparece.
  tutorials: [] as { title: string; url: string }[],
  directTitle: "Contato direto",
  statusTitle: "Status do sistema",
  statusText: "Veja se os sistemas hospedados pela Aruá estão funcionando agora.",
  statusCta: "Ver status",
  requestTitle: "Solicitar suporte",
  requestText:
    "Descreva o problema, em qual sistema ele acontece e, se puder, o que você estava fazendo.",
};

export const testimonials = {
  title: "Depoimentos",
  intro: "Quem já trabalha com a Aruá.",
};

export const contact = {
  title: "Contato",
  intro: "Conte o que você precisa.",
  whatsappCta: "Enviar pelo WhatsApp",
  whatsappNote:
    "O site não guarda esses dados: eles vão na mensagem que você envia pelo WhatsApp. Veja a",
  success: "Mensagem enviada. Obrigado pelo contato!",
  topicLabel: "Assunto",
  topics: {
    orcamento: "Solicitar orçamento",
    teste: "Testar um produto da Aruá",
    reuniao: "Agendar uma reunião",
    suporte: "Suporte técnico",
    outro: "Outro assunto",
  },
  infoTitle: "Informações",
};

// Área do cliente: ainda não existe (login de cliente fica para uma fase futura).
// A página só explica o que vem; nada de login, cadastro ou formulário aqui.
export const clientArea = {
  title: "Área do cliente",
  badge: COMING_SOON,
  intro:
    "Um espaço só seu para acompanhar o trabalho da Aruá, decidir sobre cada material e encontrar tudo do seu projeto, no celular ou no computador.",
  featuresTitle: "O que você vai poder fazer",
  features: [
    {
      icon: "track",
      title: "Acompanhar o trabalho",
      text: "As atividades do mês, o status de cada uma e as evidências do que foi feito, sem precisar perguntar.",
    },
    {
      icon: "approve",
      title: "Aprovar materiais",
      text: "Aprove posts e peças antes de irem ao ar, ou peça ajustes com um comentário. Cada decisão fica registrada.",
    },
    {
      icon: "reports",
      title: "Relatórios",
      text: "O relatório mensal com o que foi feito e os indicadores do seu negócio, cada número com fonte e data.",
    },
    {
      icon: "support",
      title: "Suporte e arquivos",
      text: "Abra chamados de suporte e encontre materiais, contratos e arquivos do seu projeto num só lugar.",
    },
  ],
  accessTitle: "Acesso pessoal e seguro",
  accessText:
    "Cada cliente recebe o próprio acesso, criado pela Aruá. Não há cadastro aberto, e cada um vê só o que é seu.",
  previewTitle: "Quer ver como vai ser?",
  previewText:
    "A área do gestor do Tlim mostra como vai ser o acompanhamento: pedidos, clientes, aprovações e pesquisas, com um restaurante de exemplo.",
  previewCta: "Ver a demonstração",
  previewHref: "/demonstracoes/tlim/visao-geral",
  contactCta: "Falar com a Aruá",
};

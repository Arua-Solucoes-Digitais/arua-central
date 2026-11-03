// =====================================================================
// TEXTOS DO SITE DA ARUÁ — edite aqui para mudar o conteúdo da página.
// Itens marcados com "A DEFINIR" ainda precisam do texto real da Aruá.
// Regra da marca: nada de números, clientes ou depoimentos inventados.
// =====================================================================

export const brand = {
  name: "Aruá",
  slogan: "Inovação com harmonia, soluções com propósito.",
  tagline: "Tecnologia que conecta pessoas e possibilidades",
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
  eyebrow: "Tecnologia que conecta pessoas e possibilidades",
  title: "Tecnologia que equilibra inovação e propósito.",
  subtitle:
    "A Aruá cria soluções digitais pensadas para resolver problemas reais, com clareza e cuidado em cada etapa.",
  primaryCta: "Fale com a gente",
  secondaryCta: "Conheça os serviços",
};

export type Item = { title: string; description: string };

export const services: { title: string; intro: string; items: Item[] } = {
  title: "Serviços",
  intro: "O que a Aruá faz por você. (A DEFINIR: substitua pelos serviços reais.)",
  items: [
    { title: "Serviço 1 — A DEFINIR", description: "Descreva em uma frase o que este serviço resolve." },
    { title: "Serviço 2 — A DEFINIR", description: "Descreva em uma frase o que este serviço resolve." },
    { title: "Serviço 3 — A DEFINIR", description: "Descreva em uma frase o que este serviço resolve." },
  ],
};

export const products: { title: string; intro: string; items: Item[] } = {
  title: "Produtos",
  intro: "Soluções prontas da Aruá. (A DEFINIR: substitua pelos produtos reais.)",
  items: [
    { title: "Produto 1 — A DEFINIR", description: "Descreva em uma frase para quem é e o que faz." },
    { title: "Produto 2 — A DEFINIR", description: "Descreva em uma frase para quem é e o que faz." },
  ],
};

export const process: { title: string; intro: string; steps: Item[] } = {
  title: "Como trabalhamos",
  intro: "Um caminho simples e transparente, do primeiro contato à entrega.",
  steps: [
    { title: "Escuta", description: "Entendemos seu contexto, seus objetivos e o problema a resolver." },
    { title: "Proposta", description: "Apresentamos um caminho claro, com escopo e etapas definidos." },
    { title: "Construção", description: "Desenvolvemos a solução com acompanhamento próximo." },
    { title: "Evolução", description: "Seguimos juntos para ajustar e melhorar o que foi entregue." },
  ],
};

export const contact = {
  title: "Contato",
  intro: "Conte o que você precisa. Respondemos pelo e-mail informado.",
  success: "Mensagem enviada. Obrigado pelo contato!",
};

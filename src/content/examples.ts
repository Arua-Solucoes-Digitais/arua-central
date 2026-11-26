// Landing pages de exemplo (negócios fictícios) em public/demos/<slug>/, exibidas em /exemplos/<slug>.
export const examples = {
  restaurante: {
    title: "Burger do Bairro",
    segment: "Restaurante",
    description: "Página de restaurante com cardápio e caminho direto para o pedido online.",
  },
  pousada: {
    title: "Pousada Serra Clara",
    segment: "Hospedagem",
    description: "Página de pousada com pedido de reserva completo pelo WhatsApp.",
  },
} as const;

export type ExampleSlug = keyof typeof examples;

export function isExample(slug: string): slug is ExampleSlug {
  return Object.hasOwn(examples, slug);
}

export const devices = [
  { id: "celular", label: "Celular", width: 390, height: 780 },
  { id: "tablet", label: "Tablet", width: 820, height: 1100 },
  { id: "pc", label: "Computador", width: 1366, height: 800 },
] as const;

export type DeviceId = (typeof devices)[number]["id"];

export const viewerCopy = {
  back: "Voltar ao portfólio",
  notice: "Exemplo com negócio fictício",
  devices: "Ver como aparece em",
  fullScreen: "Abrir em tela cheia",
  others: "Outros exemplos",
};

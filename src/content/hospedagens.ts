// Textos fixos da vitrine. O que é de cada estabelecimento fica no banco, editável pelo painel.
export const hospedagensCopy = {
  demoNotice:
    "Demonstração: este estabelecimento é fictício. Valores, horários e fotos são exemplos, e nenhuma reserva será atendida.",
  previewNotice:
    "Pré-visualização: esta vitrine não está publicada, e só quem está conectado ao painel consegue vê-la.",
  demoPhoto: "Foto de demonstração",
  cta: "Solicitar reserva",
  sections: {
    gallery: "Conheça o espaço",
    stays: "Opções de hospedagem",
    amenities: "Comodidades",
    location: "Como chegar",
    reservation: "Solicitar reserva",
  },
  reservationIntro:
    "Preencha os dados, confira o resumo e envie pelo WhatsApp. O pedido não confirma a reserva: quem confirma é o estabelecimento.",
  priceOnRequest: "Valor sob consulta",
  capacity: (n: number) => `Até ${n} ${n === 1 ? "pessoa" : "pessoas"}`,
  availability: {
    available: "Disponível",
    on_request: "Sob consulta",
    unavailable: "Indisponível no momento",
  },
  chooseStay: "Escolher esta opção",
  chosenStay: "Opção escolhida",
  openMaps: "Abrir no Google Maps",
  instagram: "Ver no Instagram",
  poweredBy: "Vitrine criada com o Aruá Hospedagens",
};

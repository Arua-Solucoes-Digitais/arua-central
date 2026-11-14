// Monta a mensagem de solicitação de reserva. A mensagem nunca afirma que a reserva está confirmada.
export type ReservationSummary = {
  propertyName: string;
  isDemo: boolean;
  stayName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export function formatPrice(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function buildReservationMessage(s: ReservationSummary) {
  const lines = [
    `Olá! Gostaria de solicitar uma reserva em *${s.propertyName}*.`,
    "",
    `*Modalidade:* ${s.stayName}`,
    `*Entrada:* ${formatDate(s.checkIn)}`,
    `*Saída:* ${formatDate(s.checkOut)}`,
    `*Pessoas:* ${s.guests}`,
    "",
    `*Nome:* ${s.name}`,
    `*Telefone:* ${s.phone}`,
  ];
  if (s.email) lines.push(`*E-mail:* ${s.email}`);
  if (s.notes) lines.push(`*Observações:* ${s.notes}`);
  lines.push("", "Aguardo a confirmação da disponibilidade e dos valores.");
  if (s.isDemo) lines.push("", "(Mensagem de demonstração: este estabelecimento é fictício.)");
  return lines.join("\n");
}

// Sem número, o próprio WhatsApp pede para escolher o contato; assim a demonstração não escreve para um desconhecido.
export function buildWhatsappUrl(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function instagramUrl(value: string) {
  const handle = value
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/\/.*$/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? `https://www.instagram.com/${handle}` : null;
}

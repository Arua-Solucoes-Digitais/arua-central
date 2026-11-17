// Ícone de cada área do gestor do Tlim.
import {
  ClipboardList,
  FileSearch,
  Instagram,
  LayoutDashboard,
  MessageCircle,
  Smile,
  ThumbsUp,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { DemoArea } from "@/content/demos/types";

export const areaIcons: Record<DemoArea, LucideIcon> = {
  "visao-geral": LayoutDashboard,
  pedidos: ClipboardList,
  cardapio: UtensilsCrossed,
  crm: Users,
  whatsapp: MessageCircle,
  instagram: Instagram,
  pesquisas: Smile,
  aprovacoes: ThumbsUp,
  "ponto-de-partida": FileSearch,
};

import type { MediaItem } from "./schemas";

// Endereço do arquivo: /media/<id> no site real; na demonstração estática, o arquivo já resolvido.
export function mediaUrl(item: Pick<MediaItem, "id" | "src">) {
  return item.src ?? `/media/${item.id}`;
}

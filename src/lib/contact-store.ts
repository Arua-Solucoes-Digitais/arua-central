// Guarda o pedido de contato do site público no Supabase, só quando a pessoa autoriza.
// O navegador só consegue chamar a função submit_contact (ver supabase/migrations): não lê nem altera nada.
// A chave "publishable" é pública por definição; a secreta nunca entra no site.
import { IS_PUBLIC_SITE } from "./demo-mode";
import type { ContactTopic } from "./schemas";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

// Sem as duas variáveis no build, o site não mostra a opção de guardar (e a privacidade diz isso).
export const CONTACT_STORAGE_ENABLED = IS_PUBLIC_SITE && url !== "" && key !== "";

export type StoredContact = {
  topic: ContactTopic;
  name: string;
  phone: string;
  message: string;
  /** Campo-armadilha: vazio para pessoas. */
  website: string;
};

export const phoneDigits = (value: string) => value.replace(/\D/g, "");

export function contactProblem(c: Pick<StoredContact, "name" | "phone">) {
  if (!c.name.trim()) return "name" as const;
  const digits = phoneDigits(c.phone).length;
  if (digits < 10 || digits > 15) return "phone" as const;
  return null;
}

// Devolve false em qualquer falha: quem chama segue para o WhatsApp do mesmo jeito.
export async function saveContact(contact: StoredContact) {
  try {
    const response = await fetch(`${url}/rest/v1/rpc/submit_contact`, {
      method: "POST",
      keepalive: true, // termina mesmo se a pessoa sair da página para o WhatsApp
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({
        p_topic: contact.topic,
        p_name: contact.name.trim(),
        p_phone: contact.phone.trim(),
        p_message: contact.message.trim(),
        p_consent: true,
        p_website: contact.website,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

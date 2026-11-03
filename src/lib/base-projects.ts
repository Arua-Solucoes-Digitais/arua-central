import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export type PublicBaseProject = {
  id: string;
  title: string;
  description: string;
  demo_url: string;
};

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:" && !/\s/.test(value);
  } catch {
    return false;
  }
}

// As mesmas regras existem no banco; aqui elas só dão um retorno mais claro no formulário.
export const baseProjectSchema = z.object({
  title: z.string().trim().min(1, "Informe o nome do projeto").max(80, "Use até 80 caracteres"),
  description: z.string().trim().min(1, "Descreva o projeto").max(300, "Use até 300 caracteres"),
  demo_url: z
    .string()
    .trim()
    .max(500, "Use até 500 caracteres")
    .refine(isHttpsUrl, "Use um endereço completo que comece com https://"),
  sort_order: z.coerce
    .number({ invalid_type_error: "Informe um número" })
    .int("Use um número inteiro")
    .min(0, "Use um número de 0 a 9999")
    .max(9999, "Use um número de 0 a 9999"),
  is_published: z.boolean(),
});

// Uma falha aqui não pode derrubar a página inicial: o site apenas mostra a seção vazia.
export async function fetchPublishedBaseProjects(): Promise<PublicBaseProject[]> {
  try {
    const { data, error } = await supabase
      .from("base_projects")
      .select("id,title,description,demo_url")
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at");
    if (error) {
      console.error("Não foi possível carregar os projetos base:", error.message);
      return [];
    }
    return data ?? [];
  } catch (error) {
    console.error("Não foi possível carregar os projetos base:", error);
    return [];
  }
}

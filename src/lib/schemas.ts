// Regras dos dados, usadas no formulário (mensagem clara) e no servidor (a validação que vale).
import { z } from "zod";

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:" && !/\s/.test(value);
  } catch {
    return false;
  }
}

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

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(1, "Escreva sua mensagem").max(2000),
  consent: z.boolean().refine((v) => v, "É preciso aceitar para enviar"),
});

export const analyticsSchema = z.object({
  event_type: z.enum(["pageview", "click"]),
  path: z.string().max(200),
  label: z.string().max(100).nullable(),
  device: z.enum(["mobile", "desktop"]),
});

export const loginSchema = z.object({
  email: z.string().max(255),
  password: z.string().max(200),
});

export const idSchema = z.string().uuid();

export type BaseProjectInput = z.output<typeof baseProjectSchema>;
export type ContactInput = z.output<typeof contactSchema>;
export type AnalyticsInput = z.output<typeof analyticsSchema>;

export type PublicBaseProject = {
  id: string;
  title: string;
  description: string;
  demo_url: string;
};
export type BaseProject = PublicBaseProject & {
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
};
export type VisitStats = {
  views: number;
  clicks: number;
  mobile: number;
  topClicks: [string, number][];
};

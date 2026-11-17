// Produto da Aruá sem demonstração e sem sistema no ar: ainda está por vir ("Em breve").
export function isComingSoon(project: { kind: string; demo_url: string | null }, live: unknown) {
  return !live && !project.demo_url && project.kind === "product";
}

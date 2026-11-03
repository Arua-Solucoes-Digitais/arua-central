import { Link } from "@tanstack/react-router";
import { Logo } from "./Shapes";

const nav = [
  { href: "#servicos", label: "Serviços" },
  { href: "#produtos", label: "Produtos" },
  { href: "#como-trabalhamos", label: "Como trabalhamos" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" aria-label="Aruá — início"><Logo /></Link>
        <nav aria-label="Principal" className="hidden gap-6 text-sm font-medium md:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} data-track={`menu-${n.label}`} className="text-muted-foreground transition-colors hover:text-primary">
              {n.label}
            </a>
          ))}
        </nav>
        <a href="#contato" data-track="menu-cta" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          Fale conosco
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Aruá. Inovação com harmonia, soluções com propósito.</span>
        <Link to="/privacidade" className="hover:text-primary">Política de Privacidade</Link>
      </div>
    </footer>
  );
}

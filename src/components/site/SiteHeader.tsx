import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Logo } from "./Shapes";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navigation } from "@/content/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" aria-label="Aruá — início">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <nav aria-label="Atalhos" className="hidden items-center gap-1 xl:flex">
            {navigation.items.slice(1, -1).map((n) => (
              <a
                key={n.href}
                href={n.href}
                data-track={`topo-${n.label}`}
                className="rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <a
            href="/?assunto=orcamento#contato"
            data-track="menu-cta"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {navigation.cta}
          </a>
          <Sheet>
            <SheetTrigger
              aria-label={navigation.menuLabel}
              data-track="menu-abrir"
              className="rounded-md p-2 text-primary transition-colors hover:bg-secondary"
            >
              <Menu aria-hidden="true" className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-4 pt-4 text-primary">{navigation.title}</SheetTitle>
              <nav aria-label="Principal" className="flex flex-col px-2">
                {navigation.items.map((n) => (
                  <SheetClose asChild key={n.href}>
                    <a
                      href={n.href}
                      data-track={`menu-${n.label}`}
                      className="rounded-md px-2 py-3 font-medium text-primary transition-colors hover:bg-secondary"
                    >
                      {n.label}
                    </a>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    to="/admin"
                    data-track="menu-area-restrita"
                    className="mt-4 border-t border-border px-2 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary"
                  >
                    {navigation.restricted}
                  </Link>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {new Date().getFullYear()} Aruá. Inovação com harmonia, soluções com propósito.
        </span>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/status" className="hover:text-primary">
            Status dos sistemas
          </Link>
          <Link to="/suporte" className="hover:text-primary">
            Suporte
          </Link>
          <Link to="/privacidade" className="hover:text-primary">
            Política de Privacidade
          </Link>
        </nav>
      </div>
    </footer>
  );
}

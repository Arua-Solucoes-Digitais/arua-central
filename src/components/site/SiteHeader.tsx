import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Shapes";
import { FloatingContact } from "./FloatingContact";
import { RevealItem, RevealList } from "./Motion";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navigation } from "@/content/site";
import { withBase } from "@/lib/paths";
import { IS_PUBLIC_SITE } from "@/lib/demo-mode";

const QUOTE_HREF = "/?assunto=orcamento#contato";

export function SiteHeader() {
  const pathname = useLocation({ select: (l) => l.pathname });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur transition-[background-color,box-shadow] duration-300 ${
        scrolled
          ? "border-border bg-background/95 shadow-sm"
          : "border-transparent bg-background/80"
      }`}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" aria-label="Aruá — início" className="tap">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <nav aria-label="Atalhos" className="hidden items-center gap-1 xl:flex">
            {navigation.items.slice(1, -1).map((n) => (
              <a
                key={n.href}
                href={withBase(n.href)}
                data-track={`topo-${n.label}`}
                aria-current={pathname === n.href ? "page" : undefined}
                className="rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary aria-[current=page]:bg-secondary"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <a
            href={withBase(QUOTE_HREF)}
            data-track="menu-cta"
            className="tap hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            {navigation.cta}
          </a>
          <Sheet>
            <SheetTrigger
              aria-label={navigation.menuLabel}
              data-track="menu-abrir"
              className="tap flex h-11 w-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-secondary"
            >
              <Menu aria-hidden="true" className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[85vw] max-w-sm flex-col gap-0 p-0">
              <SheetTitle className="px-6 pb-2 pt-6 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {navigation.title}
              </SheetTitle>
              <nav aria-label="Principal" className="flex-1 overflow-y-auto px-3">
                <RevealList onMount className="flex flex-col">
                  {navigation.items.map((n) => {
                    const current = pathname === n.href;
                    return (
                      <RevealItem key={n.href}>
                        <SheetClose asChild>
                          <a
                            href={withBase(n.href)}
                            data-track={`menu-${n.label}`}
                            aria-current={current ? "page" : undefined}
                            className="tap flex min-h-12 items-center justify-between rounded-xl px-3 py-3 text-lg font-medium text-primary transition-colors hover:bg-secondary aria-[current=page]:bg-secondary aria-[current=page]:font-semibold"
                          >
                            {n.label}
                            <ChevronRight aria-hidden="true" className="h-5 w-5 opacity-40" />
                          </a>
                        </SheetClose>
                      </RevealItem>
                    );
                  })}
                </RevealList>
              </nav>
              <div
                className="border-t border-border px-6 pt-4"
                style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
              >
                <SheetClose asChild>
                  <a
                    href={withBase(QUOTE_HREF)}
                    data-track="menu-cta-folha"
                    className="tap flex min-h-12 items-center justify-center rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
                  >
                    {navigation.cta}
                  </a>
                </SheetClose>
                {!IS_PUBLIC_SITE && (
                  <SheetClose asChild>
                    <Link
                      to="/admin"
                      data-track="menu-area-restrita"
                      className="mt-3 block py-2 text-center text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {navigation.restricted}
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <>
      <footer className="border-t border-border bg-secondary">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-24 pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:pb-8">
          <span>
            © {new Date().getFullYear()} Aruá. Inovação com harmonia, soluções com propósito.
          </span>
          <nav aria-label="Rodapé" className="flex flex-wrap gap-x-5 gap-y-1">
            {!IS_PUBLIC_SITE && (
              <Link to="/status" className="py-2 hover:text-primary">
                Status dos sistemas
              </Link>
            )}
            <Link to="/suporte" className="py-2 hover:text-primary">
              Suporte
            </Link>
            <Link to="/privacidade" className="py-2 hover:text-primary">
              Política de Privacidade
            </Link>
          </nav>
        </div>
      </footer>
      <FloatingContact />
    </>
  );
}

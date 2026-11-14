// Botão de contato ao alcance do polegar: aparece depois de rolar e some quando o
// formulário de contato está na tela (não faz sentido oferecer o que já está à vista).
import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, m } from "motion/react";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { contactInfo, floatingContact } from "@/content/site";
import { withBase } from "@/lib/paths";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { EASE_OUT } from "./Motion";

const SHOW_AFTER_PX = 560;

export function FloatingContact() {
  const isHome = useLocation({ select: (l) => l.pathname === "/" });
  const [scrolled, setScrolled] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const form = document.getElementById("contato");
    if (!form) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFormVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.1 },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, [isHome]);

  const whatsapp = contactInfo.whatsapp.replace(/\D/g, "");
  const link = whatsapp
    ? {
        href: buildWhatsappUrl(whatsapp, floatingContact.whatsappMessage),
        label: floatingContact.whatsappLabel,
        external: true,
      }
    : {
        href: isHome ? "#contato" : withBase("/?assunto=orcamento#contato"),
        label: floatingContact.quoteLabel,
        external: false,
      };

  return (
    <AnimatePresence>
      {scrolled && !formVisible && (
        <m.a
          key="floating-contact"
          href={link.href}
          {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          data-track="flutuante-contato"
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
          whileTap={{ scale: 0.94 }}
          className="fixed right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 md:right-6"
          style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
          <MessageCircle aria-hidden="true" className="h-5 w-5" />
          {link.label}
        </m.a>
      )}
    </AnimatePresence>
  );
}

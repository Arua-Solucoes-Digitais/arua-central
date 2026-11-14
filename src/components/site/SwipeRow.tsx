// No celular: cartões lado a lado que se arrastam com o dedo (rolagem nativa com encaixe),
// com o próximo cartão aparecendo na borda e pontos que mostram a posição.
// A partir de md vira grade comum. Os itens aparecem em sequência (RevealList).
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { RevealItem, RevealList } from "./Motion";

export function SwipeRow({
  label,
  children,
  desktop = "md:grid-cols-2 lg:grid-cols-3",
  as = "ul",
  tone = "light",
}: {
  label: string;
  children: ReactNode;
  desktop?: string;
  as?: "ul" | "ol";
  /** "dark" for carousels on a dark (primary) background. */
  tone?: "light" | "dark";
}) {
  const dot =
    tone === "dark"
      ? ["bg-primary-foreground", "bg-primary-foreground/30"]
      : ["bg-primary", "bg-primary/25"];
  const count = Children.count(children);
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const list = () => listRef.current?.firstElementChild as HTMLElement | null;

  const update = useCallback(() => {
    const el = list();
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setActive(atEnd ? count - 1 : Math.round(el.scrollLeft / step));
  }, [count]);

  useEffect(() => {
    const el = list();
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
    };
  }, [update]);

  function goTo(index: number) {
    const el = list();
    const item = el?.children[index] as HTMLElement | undefined;
    if (!el || !item) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const padding = parseFloat(getComputedStyle(el).scrollPaddingLeft || "0");
    el.scrollTo({ left: item.offsetLeft - padding, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <div role="region" aria-roledescription="carrossel" aria-label={label}>
      <div ref={listRef}>
        <RevealList
          as={as}
          className={`relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-4 pt-1 [scrollbar-width:none] md:mx-0 md:grid md:gap-6 md:overflow-visible md:px-0 md:pb-0 md:pt-0 [&::-webkit-scrollbar]:hidden ${desktop}`}
        >
          {children}
        </RevealList>
      </div>
      {count > 1 && (
        <div className="mt-2 flex justify-center gap-1 md:hidden">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Mostrar item ${i + 1} de ${count}`}
              aria-current={i === active ? "true" : undefined}
              className="flex h-8 w-8 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={`block h-2 rounded-full transition-all duration-300 ${
                  i === active ? `w-6 ${dot[0]}` : `w-2 ${dot[1]}`
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Item do carrossel: ocupa ~85% da largura no celular para o próximo aparecer na borda.
export function SwipeItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <RevealItem
      className={`flex shrink-0 basis-[85%] snap-start sm:basis-[60%] md:basis-auto ${className}`}
    >
      {children}
    </RevealItem>
  );
}

// Animações do site (Motion, nível médio). Só transform e opacity; tudo respeita
// "reduzir movimento" do sistema (MotionConfig reducedMotion="user").
// Sem JavaScript, o <noscript> do layout raiz mostra todo o conteúdo animado.
import { LazyMotion, MotionConfig, domAnimation, m, type Variants } from "motion/react";
import type { ReactNode } from "react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.5, ease: EASE_OUT }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}

const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0 },
};

const group: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const VIEWPORT = { once: true, amount: 0.15 } as const;

// Bloco que sobe e aparece quando entra na tela (ou logo ao abrir, com onMount).
export function Reveal({
  children,
  className,
  delay = 0,
  onMount = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  onMount?: boolean;
}) {
  const trigger = onMount ? { animate: "shown" } : { whileInView: "shown", viewport: VIEWPORT };
  return (
    <m.div
      data-reveal
      className={className}
      variants={rise}
      initial="hidden"
      {...trigger}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
    >
      {children}
    </m.div>
  );
}

// Lista cujos itens aparecem em sequência (stagger). Use com <RevealItem>.
export function RevealList({
  as = "ul",
  children,
  className,
  onMount = false,
  ...rest
}: {
  as?: "ul" | "ol" | "div";
  children: ReactNode;
  className?: string;
  onMount?: boolean;
  "aria-label"?: string;
}) {
  const Tag = as === "ol" ? m.ol : as === "div" ? m.div : m.ul;
  const trigger = onMount ? { animate: "shown" } : { whileInView: "shown", viewport: VIEWPORT };
  return (
    <Tag className={className} variants={group} initial="hidden" {...trigger} {...rest}>
      {children}
    </Tag>
  );
}

export function RevealItem({
  as = "li",
  children,
  className,
  id,
}: {
  as?: "li" | "div";
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const Tag = as === "div" ? m.div : m.li;
  return (
    <Tag data-reveal id={id} className={className} variants={rise}>
      {children}
    </Tag>
  );
}

// Número que conta de 0 até o valor quando entra na tela. Feito com a API gratuita do Motion
// (animate + useInView), no lugar do AnimateNumber do Motion+ (pago). Sem JavaScript, ou com
// "reduzir movimento", mostra o valor final direto.
import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/content/demos";

export function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const started = useRef(false);

  // Fora da tela ao abrir: começa do zero, para contar quando aparecer.
  useEffect(() => {
    if (!reduced && !started.current && !inView) setShown(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!inView || reduced || started.current) return;
    started.current = true;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(v),
    });
    return () => {
      controls.stop();
      // Em desenvolvimento o React monta duas vezes: libera para a animação recomeçar.
      started.current = false;
    };
  }, [inView, reduced, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(reduced ? value : shown, decimals)}
    </span>
  );
}

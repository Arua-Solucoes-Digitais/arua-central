// Marca d'água fixa de toda página de demonstração: deixa claro, sem atrapalhar o uso, que a
// solução é da Aruá, e sempre oferece o caminho de volta ao site da Aruá.
// Borrão progressivo no rodapé (não captura cliques); só a marca e o botão recebem toque.
import { ArrowLeft } from "lucide-react";
import { LogoSymbol } from "@/components/site/Shapes";
import { demoCopy } from "@/content/demos";
import { withBase } from "@/lib/paths";

/** Altura reservada no fim da página, para o conteúdo não ficar preso sob a marca. */
export const WATERMARK_SPACE = "pb-28";

export function DemoWatermark() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-28 backdrop-blur-md [mask-image:linear-gradient(to_top,black_25%,transparent)]"
      />
      <div
        role="note"
        aria-label={demoCopy.watermark}
        className="pointer-events-none fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex flex-wrap items-center justify-center gap-2 px-4"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0B2D5B]/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white ring-1 ring-white/20 backdrop-blur">
          <LogoSymbol className="h-3.5 w-auto brightness-0 invert" />
          {demoCopy.watermark}
        </span>
        <a
          href={withBase("/portfolio")}
          data-track="demo-voltar-arua"
          className="tap pointer-events-auto inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#0B2D5B] px-4 text-sm font-semibold text-white shadow-lg shadow-[#0B2D5B]/30 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c542] motion-reduce:transition-none"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {demoCopy.backToArua}
        </a>
      </div>
    </>
  );
}

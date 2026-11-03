import logoSymbol from "@/assets/arua_logo_symbol.png";

// Ondas suaves de fundo, como na apresentação de marca.
export function SoftWaves() {
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 600" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
      <path d="M0,0 C300,120 200,420 0,600 Z" fill="var(--aru-light)" />
      <path d="M1440,0 C1000,80 900,450 1440,600 Z" fill="var(--aru-light)" />
      <path d="M1440,120 C1150,200 1080,480 1300,600" stroke="var(--border)" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function LogoSymbol({ className = "h-8 w-auto" }: { className?: string }) {
  return <img src={logoSymbol} alt="" aria-hidden="true" className={className} />;
}

export function Logo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-2xl font-semibold tracking-tight ${inverted ? "text-primary-foreground" : "text-primary"} ${className}`}>
      <LogoSymbol className="h-7 w-auto" />
      Aruá
    </span>
  );
}

// Sublinhado em curva usado sob o slogan.
export function Swoosh({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 220 20" className={className} fill="none">
      <path d="M2,18 C60,2 150,0 218,8" stroke="var(--aru-tech)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

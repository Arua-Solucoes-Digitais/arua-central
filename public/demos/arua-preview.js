/* Camada da Aruá nas páginas de exemplo: borrão progressivo no rodapé, marca d'água e botões.
 * Uso: <script src="../arua-preview.js" data-business="Nome do exemplo" defer></script>
 * O borrão fica abaixo dos controles e não captura cliques. */
(function () {
  "use strict";
  var WHATSAPP = "5538999636208"; // WhatsApp da Aruá
  var script = document.currentScript;
  var business = (script && script.getAttribute("data-business")) || "página de exemplo";

  var css =
    ".arua-blur{position:fixed;left:0;right:0;bottom:0;height:120px;z-index:53;pointer-events:none;" +
    "-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);" +
    "-webkit-mask-image:linear-gradient(to top,#000 20%,transparent);mask-image:linear-gradient(to top,#000 20%,transparent)}" +
    ".arua-preview{position:fixed;left:0;right:0;bottom:calc(12px + env(safe-area-inset-bottom));z-index:9999;" +
    "display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;padding:0 12px;pointer-events:none;" +
    "font:600 13px/1.2 system-ui,-apple-system,'Segoe UI',sans-serif}" +
    ".arua-mark{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:rgba(10,18,32,.72);" +
    "border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:7px 12px}" +
    ".arua-preview a{pointer-events:auto;display:inline-flex;align-items:center;min-height:44px;padding:0 16px;" +
    "border-radius:999px;text-decoration:none;box-shadow:0 8px 24px rgba(11,45,91,.35)}" +
    ".arua-back{background:#fff;color:#0B2D5B}.arua-cta{background:#0B2D5B;color:#fff}" +
    ".arua-preview a:focus-visible{outline:3px solid #00A6FF;outline-offset:2px}" +
    ".arua-spacer{height:130px}" +
    "@media (max-width:480px){.arua-mark{position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);white-space:nowrap}}" +
    "@media print{.arua-blur,.arua-preview,.arua-spacer{display:none}}";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var blur = el("div", "arua-blur");
  blur.setAttribute("aria-hidden", "true");

  var bar = el("div", "arua-preview");
  bar.setAttribute("role", "note");
  bar.setAttribute("aria-label", "Modo demonstração da Aruá");
  bar.appendChild(el("span", "arua-mark", "Modo demonstração • Aruá ©"));

  var back = el("a", "arua-back", "← Voltar à Aruá");
  back.href = "../../portfolio";
  back.target = "_top"; // sai também da moldura da vitrine
  bar.appendChild(back);

  var cta = el("a", "arua-cta", "Quero um site assim");
  cta.href =
    "https://wa.me/" + WHATSAPP + "?text=" +
    encodeURIComponent(
      "Olá! Vi o exemplo " + business + " no site da Aruá e quero algo assim para o meu negócio.",
    );
  cta.target = "_blank";
  cta.rel = "noopener noreferrer";
  bar.appendChild(cta);

  document.body.appendChild(el("div", "arua-spacer"));
  document.body.appendChild(blur);
  document.body.appendChild(bar);
})();

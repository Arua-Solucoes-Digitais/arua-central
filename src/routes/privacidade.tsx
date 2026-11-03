import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Aruá" },
      { name: "description", content: "Como a Aruá trata os dados enviados pelo site, de acordo com a LGPD." },
      { property: "og:title", content: "Política de Privacidade — Aruá" },
      { property: "og:description", content: "Como a Aruá trata os dados enviados pelo site (LGPD)." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-3xl space-y-5 px-4 py-16 text-muted-foreground">
        <h1 className="text-3xl font-bold text-primary">Política de Privacidade</h1>
        <p>Esta página explica, de forma simples, como tratamos os dados enviados por este site, seguindo a Lei Geral de Proteção de Dados (LGPD).</p>
        <h2 className="text-xl font-semibold text-primary">Formulário de contato</h2>
        <p>Guardamos nome, e-mail, telefone (se informado) e a mensagem, apenas para responder ao seu contato. Não vendemos nem compartilhamos esses dados.</p>
        <h2 className="text-xl font-semibold text-primary">Medição de visitas</h2>
        <p>Contamos visitas e cliques de forma anônima: sem cookies, sem endereço IP e sem identificar você. Registramos apenas a página, o botão clicado e se o acesso foi por celular ou computador. Se o seu navegador pede "não rastrear", nada é registrado.</p>
        <h2 className="text-xl font-semibold text-primary">Seus direitos</h2>
        <p>Você pode pedir acesso, correção ou exclusão dos seus dados respondendo ao e-mail que receber da Aruá. (A DEFINIR: e-mail oficial de contato para privacidade.)</p>
      </main>
      <SiteFooter />
    </>
  );
}

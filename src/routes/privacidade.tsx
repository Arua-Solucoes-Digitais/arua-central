import { createFileRoute } from "@tanstack/react-router";
import { contactInfo } from "@/content/site";
import { IS_PUBLIC_SITE } from "@/lib/demo-mode";
import { CONTACT_STORAGE_ENABLED } from "@/lib/contact-store";
import { SiteHeader, SiteFooter } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Aruá" },
      {
        name: "description",
        content: "Como a Aruá trata os dados enviados pelo site, de acordo com a LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade — Aruá" },
      {
        property: "og:description",
        content: "Como a Aruá trata os dados enviados pelo site (LGPD).",
      },
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
        <p>
          Esta página explica, de forma simples, como tratamos os dados enviados por este site,
          seguindo a Lei Geral de Proteção de Dados (LGPD).
        </p>
        {IS_PUBLIC_SITE ? (
          <PublicSiteSections />
        ) : (
          <>
            <h2 className="text-xl font-semibold text-primary">Formulário de contato</h2>
            <p>
              Guardamos nome, e-mail, telefone (se informado) e a mensagem, apenas para responder ao
              seu contato. Não vendemos nem compartilhamos esses dados.
            </p>
            <h2 className="text-xl font-semibold text-primary">Pedidos de reserva</h2>
            <p>
              Nas páginas de hospedagem, guardamos nome, telefone, e-mail (se informado), datas,
              quantidade de pessoas e observações, para o estabelecimento responder ao seu pedido.
              Ao enviar pelo WhatsApp, a mensagem também passa a seguir as regras daquele serviço. O
              pedido não confirma a reserva: quem confirma é o estabelecimento.
            </p>
            <h2 className="text-xl font-semibold text-primary">Medição de visitas</h2>
            <p>
              Contamos visitas e cliques de forma anônima: sem cookies, sem endereço IP e sem
              identificar você. Registramos apenas a página, o botão clicado e se o acesso foi por
              celular ou computador. Se o seu navegador pede "não rastrear", nada é registrado.
            </p>
            <h2 className="text-xl font-semibold text-primary">Seus direitos</h2>
            <p>
              Você pode pedir acesso, correção ou exclusão dos seus dados respondendo ao e-mail que
              receber da Aruá. (A DEFINIR: e-mail oficial de contato para privacidade.)
            </p>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

const heading = "text-xl font-semibold text-primary";

// Site do domínio: estático, sem formulário que grave dados, sem cookies e sem medição própria.
function PublicSiteSections() {
  return (
    <>
      <h2 className={heading}>Contato</h2>
      {CONTACT_STORAGE_ENABLED ? (
        <>
          <p>
            Nome e mensagem vão no texto que você mesmo envia pelo WhatsApp, e a conversa passa a
            seguir as regras daquele serviço. O site só guarda dados se você marcar a autorização no
            formulário: assunto, nome, número de WhatsApp, mensagem e a data do envio.
          </p>
          <p>
            Usamos esses dados apenas para retornar o seu contato e acompanhar o pedido, com base no
            seu consentimento. Não vendemos esses dados. Eles ficam no banco de dados do serviço
            Supabase, em servidores nos Estados Unidos, com acesso restrito à Aruá. Guardamos
            enquanto o atendimento estiver em andamento ou até você pedir a exclusão. Você pode
            retirar o consentimento quando quiser.
          </p>
        </>
      ) : (
        <p>
          Este site não guarda o que você digita. Nome e mensagem vão no texto que você mesmo envia
          pelo WhatsApp, e a conversa passa a seguir as regras daquele serviço. Usamos o que você
          enviar para responder ao seu contato. Não vendemos esses dados.
        </p>
      )}
      <h2 className={heading}>Visitas</h2>
      <p>
        O site não usa cookies nem faz medição própria de visitas. A hospedagem (Cloudflare) trata
        dados técnicos de acesso, como o endereço IP, para entregar e proteger as páginas. As fontes
        do texto são carregadas do Google Fonts.
      </p>
      <h2 className={heading}>Demonstrações</h2>
      <p>As demonstrações usam negócios fictícios e não salvam o que você preenche.</p>
      <h2 className={heading}>Seus direitos</h2>
      <p>
        Para pedir acesso, correção ou exclusão dos seus dados, fale com a Aruá pelo{" "}
        <a
          className="text-primary underline"
          href={`https://wa.me/${contactInfo.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        .
      </p>
    </>
  );
}

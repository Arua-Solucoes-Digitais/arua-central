// Motor de aprovação de materiais, com as mesmas regras do sistema real da Aruá:
// o proprietário aprova, pede ajustes (com descrição obrigatória) ou comenta; depois de um pedido de
// ajustes, a Aruá reenvia. Cada passo entra no histórico com data, autor e origem.
// Aqui tudo fica só na memória da página: nada é salvo nem enviado, e recarregar recomeça.
import { useId, useState } from "react";
import { MessageSquare, RotateCcw, Send, ThumbsUp, Wrench } from "lucide-react";
import { ActivityStatusChip, Card, ConceptChip } from "./DemoUi";
import { CONCEPT_LABEL } from "@/content/demos";

type Status = "aguardando" | "aprovado" | "ajustes";
type Entry = { at: Date; author: string; action: string; note: string };

const OWNER = "Proprietário";
const ARUA = "Aruá (gestor)";

const formatAt = (d: Date) =>
  d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const start = (): Entry[] => [
  { at: new Date(), author: ARUA, action: "Enviado para aprovação", note: "" },
];

export function ApprovalSimulator({
  material,
}: {
  material: { title: string; channel: string; description: string };
}) {
  const [status, setStatus] = useState<Status>("aguardando");
  const [history, setHistory] = useState<Entry[]>(start);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const noteId = useId();
  const owner = OWNER;

  function record(author: string, action: string, text = "") {
    setHistory((h) => [...h, { at: new Date(), author, action, note: text }]);
    setNote("");
    setError("");
  }

  function decide(action: "aprovado" | "ajustes" | "comentario") {
    const text = note.trim();
    // As mesmas regras do servidor da Central: pedido de ajuste e comentário precisam de texto.
    if (action !== "aprovado" && !text) {
      setError(
        action === "ajustes"
          ? "Descreva o que precisa mudar: pedido de ajuste sem descrição não é aceito."
          : "Escreva o comentário antes de enviar.",
      );
      return;
    }
    if (action === "aprovado") {
      setStatus("aprovado");
      record(owner, "Aprovado", text);
    } else if (action === "ajustes") {
      setStatus("ajustes");
      record(owner, "Ajustes solicitados", text);
    } else {
      record(owner, "Comentário", text);
    }
  }

  function resend() {
    setStatus("aguardando");
    record(ARUA, "Reenviado para aprovação", "Ajustes feitos conforme o pedido.");
  }

  function restart() {
    setStatus("aguardando");
    setHistory(start());
    setNote("");
    setError("");
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <ConceptChip>{CONCEPT_LABEL}</ConceptChip>
          <ActivityStatusChip status={status} />
        </div>
        <h3 className="mt-3 font-semibold text-foreground">{material.title}</h3>
        <p className="text-xs text-muted-foreground">Canal: {material.channel}</p>
        <p className="mt-2 text-sm text-foreground">{material.description}</p>

        {status === "aguardando" && (
          <div className="mt-4">
            <label htmlFor={noteId} className="text-sm font-semibold text-foreground">
              Comentário ou ajuste{" "}
              <span className="font-normal text-muted-foreground">
                (obrigatório para pedir ajustes)
              </span>
            </label>
            <textarea
              id={noteId}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${noteId}-erro` : undefined}
              className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex.: trocar a foto do lanche por uma mais recente"
            />
            {error && (
              <p
                id={`${noteId}-erro`}
                role="alert"
                className="mt-1 text-sm font-medium text-destructive"
              >
                {error}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => decide("aprovado")}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <ThumbsUp aria-hidden="true" className="h-4 w-4" />
                Aprovar
              </button>
              <button
                type="button"
                onClick={() => decide("ajustes")}
                className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary"
              >
                <Wrench aria-hidden="true" className="h-4 w-4" />
                Pedir ajustes
              </button>
              <button
                type="button"
                onClick={() => decide("comentario")}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                <MessageSquare aria-hidden="true" className="h-4 w-4" />
                Comentar
              </button>
            </div>
          </div>
        )}

        {status === "ajustes" && (
          <div className="mt-4 rounded-xl bg-secondary p-3 text-sm text-foreground">
            <p>A Aruá faz os ajustes pedidos e reenvia o material para uma nova decisão.</p>
            <button
              type="button"
              onClick={resend}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
              Reenviar com ajustes (Aruá)
            </button>
          </div>
        )}

        {status === "aprovado" && (
          <div className="mt-4 rounded-xl bg-secondary p-3 text-sm text-foreground">
            <p>
              Aprovado. Com a decisão registrada, o material pode ir ao ar e vale como evidência da
              atividade.
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-background"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Recomeçar a simulação
            </button>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold text-foreground">Histórico do material</h3>
        <p className="text-xs text-muted-foreground">
          Origem: Central (simulação). Nada é salvo: ao recarregar, a simulação recomeça.
        </p>
        <ol aria-live="polite" className="mt-3 space-y-3">
          {history.map((entry, i) => (
            <li key={i} className="border-l-2 border-primary/40 pl-3 text-sm">
              <p className="font-semibold text-foreground">{entry.action}</p>
              <p className="text-xs text-muted-foreground">
                {formatAt(entry.at)} · {entry.author}
              </p>
              {entry.note && <p className="mt-1 text-foreground">“{entry.note}”</p>}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { interactions, type InteractionType } from "@/data/interactions";
import { clients } from "@/data/clients";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Handshake, ChevronDown, ChevronUp, MapPin } from "lucide-react";

const typeConfig: Record<InteractionType, { icon: typeof Mail; color: string }> = {
  "E-mail": { icon: Mail, color: "text-status-lead" },
  "WhatsApp": { icon: Phone, color: "text-green-400" },
  "Reunião": { icon: Handshake, color: "text-primary" },
};

export default function Historico() {
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const today = "2026-03-10";

  const filtered = clientFilter === "all"
    ? interactions
    : interactions.filter(i => i.clientId.toString() === clientFilter);

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const uniqueClients = Array.from(new Map(clients.map(c => [c.id, c])).values());

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Histórico de Interações</h1>

      <Select value={clientFilter} onValueChange={setClientFilter}>
        <SelectTrigger className="w-[280px] bg-card border-border text-sm">
          <SelectValue placeholder="Filtrar por cliente" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="all">Todos os Clientes</SelectItem>
          {uniqueClients.map(c => (
            <SelectItem key={c.id} value={c.id.toString()}>{c.contato} — {c.empresa}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {sorted.length === 0 ? (
            <p className="font-display text-sm uppercase tracking-wider text-muted-foreground text-center py-8">
              [ ERRO: 0 RESULTADOS ]
            </p>
          ) : (
            sorted.map(i => {
              const cfg = typeConfig[i.type];
              const Icon = cfg.icon;
              const isExpanded = expandedId === i.id;
              const isOverdue = i.dataPrevista && i.dataPrevista <= today;
              const needsTruncation = i.summary.length > 120;

              return (
                <div key={i.id} className="relative pl-12">
                  <div className={`absolute left-3 top-3 w-5 h-5 rounded-sm flex items-center justify-center bg-card border border-border`}>
                    <Icon className={`h-3 w-3 ${cfg.color}`} />
                  </div>
                  <div
                    className={`bg-card border border-border rounded-sm p-4 cursor-pointer transition-all ease-out duration-150 ${
                      isOverdue ? "border-l-2 border-l-heat action-pulse" : ""
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : i.id)}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-display text-xs text-muted-foreground">{formatDate(i.date)}</span>
                      <span className="font-medium text-foreground text-sm">{i.empresa}</span>
                      <span className={`text-xs uppercase font-display tracking-wider ${cfg.color}`}>{i.type}</span>
                      {i.regiao && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {i.regiao}
                        </span>
                      )}
                      <button className="ml-auto text-muted-foreground hover:text-foreground">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    <p className={`text-sm text-muted-foreground mt-2 ${!isExpanded && needsTruncation ? "line-clamp-3" : ""}`}>
                      {i.summary}
                    </p>
                    {!isExpanded && needsTruncation && (
                      <button className="font-display text-xs text-primary mt-1 uppercase tracking-wider hover:text-heat">
                        [ LER MAIS ]
                      </button>
                    )}

                    {(isExpanded || !needsTruncation) && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-display uppercase tracking-wider text-muted-foreground">Próxima Ação</p>
                        <p className="text-sm text-foreground mt-1">{i.proximaAcao}</p>
                        {i.dataPrevista && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Data prevista: <span className="text-primary font-display">{formatDate(i.dataPrevista)}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

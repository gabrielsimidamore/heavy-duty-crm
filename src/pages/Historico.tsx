import { useState } from "react";
import { interactions, type InteractionType } from "@/data/interactions";
import { clients } from "@/data/clients";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Handshake, ChevronDown, ChevronUp, MapPin, Plus, Search, Paperclip, MessageSquare } from "lucide-react";

const typeConfig: Record<InteractionType, { icon: typeof Mail; color: string; label: string }> = {
  "E-mail": { icon: Mail, color: "text-status-lead", label: "E-mail" },
  "WhatsApp": { icon: Phone, color: "text-green-400", label: "WhatsApp" },
  "Reunião": { icon: Handshake, color: "text-primary", label: "Reunião" },
};

export default function Historico() {
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showNewInteraction, setShowNewInteraction] = useState(false);

  const today = "2026-03-10";

  const filtered = interactions.filter(i => {
    const matchClient = clientFilter === "all" || i.clientId.toString() === clientFilter;
    const matchType = typeFilter === "all" || i.type === typeFilter;
    const matchSearch = !searchText || i.summary.toLowerCase().includes(searchText.toLowerCase());
    return matchClient && matchType && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const uniqueClients = Array.from(new Map(clients.map(c => [c.id, c])).values());

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Histórico de Interações</h1>
        <Dialog open={showNewInteraction} onOpenChange={setShowNewInteraction}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs font-display">
              <Plus className="h-3 w-3 mr-1" /> Nova Interação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-auto bg-popover border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Nova Interação</DialogTitle>
            </DialogHeader>
            <NewInteractionForm onClose={() => setShowNewInteraction(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-[240px] bg-card border-border text-sm">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Todos os Clientes</SelectItem>
            {uniqueClients.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.contato} — {c.empresa}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] bg-card border-border text-sm">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="E-mail">E-mail</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            <SelectItem value="Reunião">Reunião</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar no resumo..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="pl-9 bg-card border-border text-sm h-9"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="font-display text-sm uppercase tracking-wider">Nenhuma interação encontrada</p>
            </div>
          ) : (
            sorted.map(i => {
              const cfg = typeConfig[i.type];
              const Icon = cfg.icon;
              const isExpanded = expandedId === i.id;
              const isOverdue = i.dataPrevista && i.dataPrevista <= today;
              const needsTruncation = i.summary.length > 100;

              return (
                <div key={i.id} className="relative pl-12">
                  <div className="absolute left-3 top-3 w-5 h-5 rounded-full flex items-center justify-center bg-card border border-border">
                    <Icon className={`h-3 w-3 ${cfg.color}`} />
                  </div>
                  <div
                    className={`bg-card border border-border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-primary/20 ${
                      isOverdue ? "border-l-2 border-l-destructive action-pulse" : "border-l-2 border-l-primary/30"
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : i.id)}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-display text-xs text-muted-foreground">{formatDate(i.date)}</span>
                      <span className="font-medium text-foreground text-sm">{i.clientName}</span>
                      <span className="text-xs text-muted-foreground">• {i.empresa}</span>
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

                    <p className={`text-sm text-muted-foreground mt-2 ${!isExpanded && needsTruncation ? "line-clamp-2" : ""}`}>
                      {i.summary}
                    </p>

                    {(isExpanded || !needsTruncation) && i.proximaAcao && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs font-display uppercase tracking-wider text-muted-foreground">Próxima Ação</p>
                        <p className="text-sm text-foreground mt-1">{i.proximaAcao}</p>
                        {i.dataPrevista && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Data prevista: <span className={`font-display ${isOverdue ? "text-destructive" : "text-primary"}`}>{formatDate(i.dataPrevista)}</span>
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

function NewInteractionForm({ onClose }: { onClose: () => void }) {
  const uniqueClients = Array.from(new Map(clients.map(c => [c.id, c])).values());

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Cliente *</Label>
        <Select>
          <SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {uniqueClients.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.contato} — {c.empresa}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Data *</Label>
          <Input type="date" className="bg-card border-border mt-1" defaultValue="2026-03-10" />
        </div>
        <div>
          <Label className="text-xs">Tipo *</Label>
          <Select>
            <SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {["E-mail", "WhatsApp", "Reunião", "Ligação", "Visita Técnica", "LinkedIn", "Outro"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Resumo da Conversa *</Label>
        <Textarea className="bg-card border-border mt-1 min-h-[100px]" />
      </div>
      <div><Label className="text-xs">Região</Label><Input className="bg-card border-border mt-1" /></div>
      <div>
        <Label className="text-xs">Próxima Ação</Label>
        <Textarea className="bg-card border-border mt-1" />
      </div>
      <div>
        <Label className="text-xs">Data Prevista Próxima Ação</Label>
        <Input type="date" className="bg-card border-border mt-1" />
      </div>
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground">
        <Paperclip className="h-5 w-5 mx-auto mb-1 opacity-50" />
        <p className="text-xs">Arraste arquivos ou cole imagens (Ctrl+V)</p>
      </div>
      <div><Label className="text-xs">Tags</Label><Input className="bg-card border-border mt-1" placeholder="Separe por vírgula" /></div>
      <Button className="w-full font-display" onClick={onClose}>Salvar Interação</Button>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

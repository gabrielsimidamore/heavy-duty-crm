import { useState } from "react";
import { type InteractionType } from "@/data/interactions";
import { useInteractions } from "@/hooks/useInteractions";
import { useClients } from "@/hooks/useClients";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Handshake, ChevronDown, ChevronUp, MapPin, Plus, Search, Paperclip, MessageSquare, PhoneCall, Wrench, Linkedin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const typeConfig: Record<string, { icon: typeof Mail; color: string; label: string }> = {
  "E-mail": { icon: Mail, color: "text-status-lead", label: "E-mail" },
  "WhatsApp": { icon: Phone, color: "text-green-400", label: "WhatsApp" },
  "Reunião": { icon: Handshake, color: "text-primary", label: "Reunião" },
  "Ligação": { icon: PhoneCall, color: "text-yellow-400", label: "Ligação" },
  "Visita Técnica": { icon: Wrench, color: "text-orange-400", label: "Visita Técnica" },
  "LinkedIn": { icon: Linkedin, color: "text-blue-400", label: "LinkedIn" },
  "Outro": { icon: MessageSquare, color: "text-muted-foreground", label: "Outro" },
};

const defaultTypeConfig = { icon: MessageSquare, color: "text-muted-foreground", label: "Outro" };

export default function Historico() {
  const { interactions, loading } = useInteractions();
  const { clients } = useClients();
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
    <motion.div
      className="p-6 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Histórico de Interações</h1>
        <Dialog open={showNewInteraction} onOpenChange={setShowNewInteraction}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs font-display rounded-xl">
              <Plus className="h-3 w-3 mr-1" /> Nova Interação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-auto glass-elevated rounded-2xl border-0">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Nova Interação</DialogTitle>
            </DialogHeader>
            <NewInteractionForm onClose={() => setShowNewInteraction(false)} />
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 items-center glass-subtle rounded-2xl p-3"
      >
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-[240px] bg-transparent border-border/50 text-sm rounded-xl">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent className="glass-elevated border-0 rounded-2xl">
            <SelectItem value="all">Todos os Clientes</SelectItem>
            {uniqueClients.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.contato} — {c.empresa}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] bg-transparent border-border/50 text-sm rounded-xl">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="glass-elevated border-0 rounded-2xl">
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
            className="pl-9 bg-transparent border-border/50 text-sm h-9 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-border/30 to-transparent" />
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="font-display text-sm uppercase tracking-wider">Nenhuma interação encontrada</p>
            </div>
          ) : (
            sorted.map((i, idx) => {
              const cfg = typeConfig[i.type] ?? defaultTypeConfig;
              const Icon = cfg.icon;
              const isExpanded = expandedId === i.id;
              const isOverdue = i.dataPrevista && i.dataPrevista <= today;
              const needsTruncation = i.summary.length > 100;

              return (
                <motion.div
                  key={i.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.03 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-3 top-4 w-5 h-5 rounded-full flex items-center justify-center glass-subtle">
                    <Icon className={`h-3 w-3 ${cfg.color}`} />
                  </div>
                  <div
                    className={`glass glass-shimmer rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                      isOverdue ? "border-l-2 border-l-destructive action-pulse" : "border-l-2 border-l-primary/20"
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
                      <button className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    <p className={`text-sm text-muted-foreground mt-2 ${!isExpanded && needsTruncation ? "line-clamp-2" : ""}`}>
                      {i.summary}
                    </p>

                    <AnimatePresence>
                      {(isExpanded || !needsTruncation) && i.proximaAcao && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 pt-3 border-t border-border/20"
                        >
                          <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">Próxima Ação</p>
                          <p className="text-sm text-foreground mt-1">{i.proximaAcao}</p>
                          {i.dataPrevista && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Data prevista: <span className={`font-display ${isOverdue ? "text-destructive" : "text-primary"}`}>{formatDate(i.dataPrevista)}</span>
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NewInteractionForm({ onClose }: { onClose: () => void }) {
  const { clients } = useClients();
  const uniqueClients = Array.from(new Map(clients.map(c => [c.id, c])).values());

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Cliente *</Label>
        <Select>
          <SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
          <SelectContent className="glass-elevated border-0 rounded-2xl">
            {uniqueClients.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.contato} — {c.empresa}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Data *</Label>
          <Input type="date" className="bg-transparent border-border/40 mt-1 rounded-xl" defaultValue="2026-03-10" />
        </div>
        <div>
          <Label className="text-xs">Tipo *</Label>
          <Select>
            <SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent className="glass-elevated border-0 rounded-2xl">
              {["E-mail", "WhatsApp", "Reunião", "Ligação", "Visita Técnica", "LinkedIn", "Outro"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Resumo da Conversa *</Label>
        <Textarea className="bg-transparent border-border/40 mt-1 min-h-[100px] rounded-xl" />
      </div>
      <div><Label className="text-xs">Região</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
      <div>
        <Label className="text-xs">Próxima Ação</Label>
        <Textarea className="bg-transparent border-border/40 mt-1 rounded-xl" />
      </div>
      <div>
        <Label className="text-xs">Data Prevista Próxima Ação</Label>
        <Input type="date" className="bg-transparent border-border/40 mt-1 rounded-xl" />
      </div>
      <div className="border border-dashed border-border/30 rounded-2xl p-6 text-center text-muted-foreground glass-subtle hover:border-primary/20 transition-colors">
        <Paperclip className="h-5 w-5 mx-auto mb-1 opacity-50" />
        <p className="text-xs">Arraste arquivos ou cole imagens (Ctrl+V)</p>
      </div>
      <div><Label className="text-xs">Tags</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" placeholder="Separe por vírgula" /></div>
      <Button className="w-full font-display rounded-xl" onClick={onClose}>Salvar Interação</Button>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

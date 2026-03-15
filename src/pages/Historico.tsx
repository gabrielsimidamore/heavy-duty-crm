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
import { Mail, Phone, Handshake, ChevronDown, ChevronUp, MapPin, Plus, Search, Paperclip, MessageSquare, PhoneCall, Wrench, Linkedin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

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
const today = new Date().toISOString().slice(0, 10);

export default function Historico() {
  const { interactions, loading, addInteraction } = useInteractions();
  const { clients } = useClients();
  const [searchParams] = useSearchParams();
  const clienteParam = searchParams.get("cliente") || "all";

  const [clientFilter, setClientFilter] = useState<string>(clienteParam);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showNewInteraction, setShowNewInteraction] = useState(false);

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
      className="p-6 space-y-5 max-w-[1400px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <h1 className="text-[20px] font-bold text-foreground">Histórico de Interações</h1>
        <Dialog open={showNewInteraction} onOpenChange={setShowNewInteraction}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs gap-1.5 rounded-lg">
              <Plus className="h-3 w-3 mr-1" /> Nova Interação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-auto card-elevated rounded-xl border-border/60">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold font-display">Nova Interação</DialogTitle>
            </DialogHeader>
            <NewInteractionForm
              onClose={() => setShowNewInteraction(false)}
              addInteraction={addInteraction}
            />
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 items-center surface-card rounded-lg p-3"
      >
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-[240px] bg-white/[0.03] border-border/60 text-sm rounded-lg text-xs">
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent className="glass-elevated rounded-lg">
            <SelectItem value="all">Todos os Clientes</SelectItem>
            {uniqueClients.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.contato} — {c.empresa}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] bg-white/[0.03] border-border/60 text-sm rounded-lg text-xs">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="glass-elevated rounded-lg">
            <SelectItem value="all">Todos os Tipos</SelectItem>
            {Object.keys(typeConfig).map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
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
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin opacity-50" />
              <p className="font-display text-sm uppercase tracking-wider">Carregando...</p>
            </div>
          ) : sorted.length === 0 ? (
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
                    className={`surface-card rounded-lg surface-interactive p-4 cursor-pointer transition-all duration-300 ${
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

function NewInteractionForm({ onClose, addInteraction }: {
  onClose: () => void;
  addInteraction: (i: any) => Promise<boolean>;
}) {
  const { clients } = useClients();
  const uniqueClients = Array.from(new Map(clients.map(c => [c.id, c])).values());
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    date: today,
    type: "",
    summary: "",
    regiao: "",
    proximaAcao: "",
    dataPrevista: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.clientId || !form.type || !form.summary) {
      toast.error("Preencha os campos obrigatórios: Cliente, Tipo e Resumo");
      return;
    }
    const client = uniqueClients.find(c => c.id.toString() === form.clientId);
    if (!client) return;
    setSaving(true);
    const ok = await addInteraction({
      clientId: client.id,
      clientName: client.contato,
      empresa: client.empresa,
      date: form.date,
      type: form.type as InteractionType,
      summary: form.summary,
      proximaAcao: form.proximaAcao,
      dataPrevista: form.dataPrevista || undefined,
      regiao: form.regiao || undefined,
    });
    setSaving(false);
    if (ok) {
      toast.success("Interação salva com sucesso!");
      onClose();
    } else {
      toast.error("Erro ao salvar. Tente novamente.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-mono text-muted-foreground">Cliente *</Label>
        <Select value={form.clientId} onValueChange={v => set("clientId", v)}>
          <SelectTrigger className="bg-background border-border mt-1 rounded-md"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
          <SelectContent className="glass-elevated rounded-lg">
            {uniqueClients.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.contato} — {c.empresa}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] font-mono text-muted-foreground">Data *</Label>
          <Input type="date" className="bg-background border-border mt-1 rounded-md" value={form.date} onChange={e => set("date", e.target.value)} />
        </div>
        <div>
          <Label className="text-[11px] font-mono text-muted-foreground">Tipo *</Label>
          <Select value={form.type} onValueChange={v => set("type", v)}>
            <SelectTrigger className="bg-background border-border mt-1 rounded-md"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent className="glass-elevated rounded-lg">
              {Object.keys(typeConfig).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-[11px] font-mono text-muted-foreground">Resumo da Conversa *</Label>
        <Textarea className="bg-transparent border-border/40 mt-1 min-h-[100px] rounded-xl" value={form.summary} onChange={e => set("summary", e.target.value)} />
      </div>
      <div><Label className="text-[11px] font-mono text-muted-foreground">Região</Label><Input className="bg-background border-border mt-1 rounded-md" value={form.regiao} onChange={e => set("regiao", e.target.value)} /></div>
      <div>
        <Label className="text-[11px] font-mono text-muted-foreground">Próxima Ação</Label>
        <Textarea className="bg-background border-border mt-1 rounded-md" value={form.proximaAcao} onChange={e => set("proximaAcao", e.target.value)} />
      </div>
      <div>
        <Label className="text-[11px] font-mono text-muted-foreground">Data Prevista Próxima Ação</Label>
        <Input type="date" className="bg-background border-border mt-1 rounded-md" value={form.dataPrevista} onChange={e => set("dataPrevista", e.target.value)} />
      </div>
      <div className="border border-dashed border-border/30 rounded-2xl p-6 text-center text-muted-foreground glass-subtle hover:border-primary/20 transition-colors">
        <Paperclip className="h-5 w-5 mx-auto mb-1 opacity-50" />
        <p className="text-[11px] font-mono text-muted-foreground">Arraste arquivos ou cole imagens (Ctrl+V)</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 rounded-lg border-white/[0.08] bg-white/[0.03] text-foreground/50 hover:text-foreground" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button className="flex-1 rounded-md font-semibold" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Salvando...</> : "Salvar Interação"}
        </Button>
      </div>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

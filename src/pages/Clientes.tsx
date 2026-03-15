import { useState, useCallback } from "react";
import { type Client, type ClientStatus, type TipoEmpresa } from "@/data/clients";
import { useClients } from "@/hooks/useClients";
import { useInteractions } from "@/hooks/useInteractions";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, History, Plus, MessageCircle, LayoutGrid, List, User, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const statuses: ClientStatus[] = ["Ativo", "Lead", "Prospect", "Inativo", "Sem compras"];
const tipos: TipoEmpresa[] = ["Federações", "Locadoras", "Seguradoras", "Transportadora", "Associações", "Tecnologia"];

const kanbanColumns: { status: ClientStatus; color: string }[] = [
  { status: "Lead", color: "border-status-lead" },
  { status: "Prospect", color: "border-status-prospect" },
  { status: "Ativo", color: "border-status-ativo" },
  { status: "Inativo", color: "border-status-inativo" },
];

export default function Clientes() {
  // Usa diretamente do hook — sem estado local duplicado
  const { clients, loading, addClient, updateClient } = useClients();
  const { interactions } = useInteractions();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [showNewClient, setShowNewClient] = useState(false);

  const filtered = clients.filter(c => {
    const matchSearch = !search || c.contato.toLowerCase().includes(search.toLowerCase()) || c.empresa.toLowerCase().includes(search.toLowerCase()) || (c.cnpj && c.cnpj.includes(search));
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchTipo = tipoFilter === "all" || c.tipoEmpresa === tipoFilter;
    return matchSearch && matchStatus && matchTipo;
  });

  const clientInteractions = selectedClient
    ? interactions.filter(i => i.clientId === selectedClient.id)
    : [];

  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination) return;
    const clientId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId as ClientStatus;
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    const ok = await updateClient({ ...client, status: newStatus });
    if (ok) toast.success(`Cliente movido para "${newStatus}"`);
    else toast.error("Erro ao atualizar status");
  }, [clients, updateClient]);

  return (
    <motion.div className="p-6 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-[20px] font-bold text-foreground">Clientes</h1>
        <div className="flex gap-2">
          <Button variant={viewMode === "table" ? "default" : "outline"} size="icon" className="h-8 w-8 rounded-xl" onClick={() => setViewMode("table")}><List className="h-4 w-4" /></Button>
          <Button variant={viewMode === "kanban" ? "default" : "outline"} size="icon" className="h-8 w-8 rounded-xl" onClick={() => setViewMode("kanban")}><LayoutGrid className="h-4 w-4" /></Button>
          <Dialog open={showNewClient} onOpenChange={setShowNewClient}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs gap-1.5 rounded-md"><Plus className="h-3 w-3 mr-1" /> Novo Cliente</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto glass-elevated rounded-lg">
              <DialogHeader><DialogTitle className="text-base font-semibold font-display text-foreground">Novo Cliente</DialogTitle></DialogHeader>
              <NewClientForm onClose={() => setShowNewClient(false)} addClient={addClient} />
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex flex-wrap gap-3 items-center surface-card rounded-lg p-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, empresa ou CNPJ..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white/[0.04] border-white/[0.08] text-xs text-foreground/60 rounded-lg" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-white/[0.04] border-white/[0.08] text-xs text-foreground/60 rounded-lg"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="glass-elevated rounded-lg">
            <SelectItem value="all">Todos Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[180px] bg-white/[0.04] border-white/[0.08] text-xs text-foreground/60 rounded-lg"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent className="glass-elevated rounded-lg">
            <SelectItem value="all">Todos Tipos</SelectItem>
            {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div key="table" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="surface-card rounded-lg overflow-hidden w-full">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin opacity-50" />
              </div>
            ) : (
            <table className="w-full text-xs" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "5%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-border">
                  {["Contato", "Empresa", "Telefone", "E-mail", "Tipo", "Região", "Frota", "Status", "Score", ""].map(h => (
                    <th key={h} className="text-left px-3 py-3 font-display text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="font-display text-sm uppercase tracking-wider">Nenhum cliente encontrado</p>
                  </td></tr>
                ) : (
                  filtered.map((c, idx) => (
                    <motion.tr key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.025 }}
                      onClick={() => setSelectedClient(c)} className="border-b border-border hover:bg-accent cursor-pointer transition-all duration-200">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full glass-subtle text-primary font-display text-[9px] flex items-center justify-center font-bold shrink-0">
                            {c.contato.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground truncate">{c.contato}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground"><span className="block truncate">{c.empresa}</span></td>
                      <td className="px-3 py-2.5 text-muted-foreground"><span className="block truncate">{c.telefone || "—"}</span></td>
                      <td className="px-3 py-2.5 text-muted-foreground"><span className="block truncate">{c.email || "—"}</span></td>
                      <td className="px-3 py-2.5 text-muted-foreground"><span className="block truncate">{c.tipoEmpresa || "—"}</span></td>
                      <td className="px-3 py-2.5 text-muted-foreground"><span className="block truncate">{c.regiao || "—"}</span></td>
                      <td className="px-3 py-2.5 text-muted-foreground text-center">{c.frota ?? "—"}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={c.status} /></td>
                      <td className="px-3 py-2.5 text-muted-foreground text-center">{c.scoreFidelidade || "—"}</td>
                      <td className="px-3 py-2.5">
                        <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 rounded-lg" onClick={e => { e.stopPropagation(); setSelectedClient(c); }}>Ver</Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
            )}
          </motion.div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <motion.div key="kanban" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kanbanColumns.map((col, colIdx) => (
                <Droppable droppableId={col.status} key={col.status}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: colIdx * 0.08 }}
                      className={`space-y-3 min-h-[120px] rounded-2xl p-2 transition-colors ${snapshot.isDraggingOver ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}
                    >
                      <div className={`flex items-center gap-2 pb-2 border-b-2 ${col.color}`}>
                        <StatusBadge status={col.status} />
                        <span className="text-xs text-muted-foreground">({filtered.filter(c => c.status === col.status).length})</span>
                      </div>
                      {filtered.filter(c => c.status === col.status).map((c, idx) => (
                        <Draggable key={c.id} draggableId={c.id.toString()} index={idx}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedClient(c)}
                              className={`surface-card rounded-lg surface-interactive p-3.5 cursor-grab active:cursor-grabbing transition-all ${snapshot.isDragging ? "ring-2 ring-primary/40 shadow-xl shadow-primary/10 scale-105" : ""}`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-full glass-subtle text-primary font-display text-[10px] flex items-center justify-center font-bold">{c.contato.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                                <div>
                                  <p className="font-medium text-foreground text-sm">{c.contato}</p>
                                  <p className="text-xs text-muted-foreground">{c.empresa}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{c.tipoEmpresa}</span>
                                {c.frota && <span>• Frota: {c.frota}</span>}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {filtered.filter(c => c.status === col.status).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-xs surface-card rounded-lg">Nenhum cliente</div>
                      )}
                      {provided.placeholder}
                    </motion.div>
                  )}
                </Droppable>
              ))}
            </motion.div>
          </DragDropContext>
        )}
      </AnimatePresence>

      {/* Client Detail Drawer */}
      <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <SheetContent className="card-elevated border-l border-border/50 w-[420px] sm:w-[480px] overflow-auto">
          {selectedClient && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-12 h-12 rounded-full glass text-primary text-base font-semibold font-display text-foreground flex items-center justify-center font-bold">
                    {selectedClient.contato.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </motion.div>
                  <div>
                    <SheetTitle className="text-base font-semibold font-display text-foreground text-foreground">{selectedClient.contato}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{selectedClient.empresa}</p>
                  </div>
                </div>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <StatusBadge status={selectedClient.status} />
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow label="Telefone" value={selectedClient.telefone} />
                  <DetailRow label="E-mail" value={selectedClient.email} />
                  <DetailRow label="Tipo" value={selectedClient.tipoEmpresa} />
                  <DetailRow label="Região" value={selectedClient.regiao} />
                  <DetailRow label="Frota" value={selectedClient.frota?.toString() ?? "—"} />
                  <DetailRow label="Marca" value={selectedClient.marcaPrincipal} />
                  <DetailRow label="Score" value={selectedClient.scoreFidelidade} />
                  {selectedClient.cnpj && <DetailRow label="CNPJ" value={selectedClient.cnpj} />}
                </div>
                {selectedClient.observacoes && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-accent border border-border rounded-lg p-3.5">
                    <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm text-foreground">{selectedClient.observacoes}</p>
                  </motion.div>
                )}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-accent border border-border rounded-lg p-3.5">
                  <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1">Interações Vinculadas</p>
                  <p className="font-display text-2xl font-bold text-primary">{clientInteractions.length}</p>
                  {clientInteractions.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Último contato: {formatDate(clientInteractions.sort((a, b) => b.date.localeCompare(a.date))[0].date)}</p>
                  )}
                </motion.div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs border-white/[0.08] hover:bg-white/[0.06] rounded-lg text-foreground/50 hover:text-foreground"
                    onClick={() => { navigate(`/historico?cliente=${selectedClient.id}`); setSelectedClient(null); }}>
                    <History className="h-3 w-3 mr-1" /> Ver Histórico
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs border-white/[0.08] hover:bg-white/[0.06] rounded-lg text-foreground/50 hover:text-foreground">
                    <Plus className="h-3 w-3 mr-1" /> Nova Interação
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs border-white/[0.08] hover:bg-white/[0.06] rounded-lg text-foreground/50 hover:text-foreground"><MessageCircle className="h-3 w-3" /></Button>
                </div>
              </div>
            </motion.div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}

function NewClientForm({ onClose, addClient }: { onClose: () => void; addClient: (c: any) => Promise<boolean> }) {
  const [score, setScore] = useState([50]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    contato: "", cargo: "", empresa: "", cnpj: "", telefone: "", whatsapp: "",
    email: "", site: "", status: "" as ClientStatus | "", tipoEmpresa: "" as TipoEmpresa | "",
    origemLead: "", regiao: "", endereco: "", frota: "", marcaPrincipal: "",
    potencialCompra: "", formaPagamento: "", nivelRelacionamento: "", descontoMax: "",
    concorrentes: "", tipoParceria: "", statusContrato: "", comissao: "", numContrato: "",
    obsParceria: "", observacoes: "", tags: "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.contato || !form.empresa || !form.status || !form.tipoEmpresa) {
      toast.error("Preencha os campos obrigatórios: Contato, Empresa, Status e Tipo");
      return;
    }
    setSaving(true);
    const ok = await addClient({
      contato: form.contato, empresa: form.empresa, telefone: form.telefone,
      email: form.email, tipoEmpresa: form.tipoEmpresa as TipoEmpresa,
      regiao: form.regiao, tipo: form.origemLead || "Lead",
      frota: form.frota ? parseInt(form.frota) : null,
      marcaPrincipal: form.marcaPrincipal || "—",
      status: form.status as ClientStatus,
      scoreFidelidade: score[0] >= 61 ? "Alto" : score[0] >= 31 ? "Médio" : "Baixo",
      cnpj: form.cnpj || undefined,
      observacoes: form.observacoes || undefined,
    });
    setSaving(false);
    if (ok) { toast.success("Cliente salvo com sucesso!"); onClose(); }
    else toast.error("Erro ao salvar. Tente novamente.");
  };

  return (
    <Tabs defaultValue="dados" className="w-full">
      <TabsList className="w-full bg-accent border border-border rounded-lg">
        <TabsTrigger value="dados" className="flex-1 text-xs rounded-md">Dados Gerais</TabsTrigger>
        <TabsTrigger value="frota" className="flex-1 text-xs rounded-md">Frota</TabsTrigger>
        <TabsTrigger value="comercial" className="flex-1 text-xs rounded-md">Comercial</TabsTrigger>
        <TabsTrigger value="parceria" className="flex-1 text-xs rounded-md">Parceria</TabsTrigger>
        <TabsTrigger value="obs" className="flex-1 text-xs rounded-md">Observações</TabsTrigger>
      </TabsList>

      <TabsContent value="dados" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[11px] font-mono text-muted-foreground">Nome do Contato *</Label><Input className="bg-background border-border mt-1 rounded-md" value={form.contato} onChange={e => set("contato", e.target.value)} /></div>
          <div><Label className="text-[11px] font-mono text-muted-foreground">Cargo</Label><Input className="bg-background border-border mt-1 rounded-md" value={form.cargo} onChange={e => set("cargo", e.target.value)} /></div>
          <div><Label className="text-[11px] font-mono text-muted-foreground">Empresa *</Label><Input className="bg-background border-border mt-1 rounded-md" value={form.empresa} onChange={e => set("empresa", e.target.value)} /></div>
          <div><Label className="text-[11px] font-mono text-muted-foreground">CNPJ</Label><Input className="bg-background border-border mt-1 rounded-md" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={e => set("cnpj", e.target.value)} /></div>
          <div><Label className="text-[11px] font-mono text-muted-foreground">Telefone</Label><Input className="bg-background border-border mt-1 rounded-md" value={form.telefone} onChange={e => set("telefone", e.target.value)} /></div>
          <div><Label className="text-[11px] font-mono text-muted-foreground">WhatsApp</Label><Input className="bg-background border-border mt-1 rounded-md" value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} /></div>
          <div><Label className="text-[11px] font-mono text-muted-foreground">E-mail</Label><Input type="email" className="bg-background border-border mt-1 rounded-md" value={form.email} onChange={e => set("email", e.target.value)} /></div>
          <div><Label className="text-[11px] font-mono text-muted-foreground">Site</Label><Input type="url" className="bg-background border-border mt-1 rounded-md" value={form.site} onChange={e => set("site", e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[11px] font-mono text-muted-foreground">Status *</Label>
            <Select value={form.status} onValueChange={v => set("status", v)}>
              <SelectTrigger className="bg-background border-border mt-1 rounded-md"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="glass-elevated rounded-lg">{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select></div>
          <div><Label className="text-[11px] font-mono text-muted-foreground">Tipo de Empresa *</Label>
            <Select value={form.tipoEmpresa} onValueChange={v => set("tipoEmpresa", v)}>
              <SelectTrigger className="bg-background border-border mt-1 rounded-md"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="glass-elevated rounded-lg">{tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select></div>
          <div><Label className="text-[11px] font-mono text-muted-foreground">Origem do Lead</Label>
            <Select value={form.origemLead} onValueChange={v => set("origemLead", v)}>
              <SelectTrigger className="bg-background border-border mt-1 rounded-md"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="glass-elevated rounded-lg">{["Indicação", "LinkedIn", "E-mail Mkt", "Ligação", "Evento", "Site", "Outro"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select></div>
          <div><Label className="text-[11px] font-mono text-muted-foreground">Região de Atuação</Label><Input className="bg-background border-border mt-1 rounded-md" value={form.regiao} onChange={e => set("regiao", e.target.value)} /></div>
        </div>
        <div><Label className="text-[11px] font-mono text-muted-foreground">Endereço Completo</Label><Textarea className="bg-transparent border-border/40 mt-1 min-h-[60px] rounded-xl" value={form.endereco} onChange={e => set("endereco", e.target.value)} /></div>
      </TabsContent>

      <TabsContent value="frota" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-[11px] font-mono text-muted-foreground">Quantidade Total de Veículos</Label><Input type="number" className="bg-background border-border mt-1 rounded-md" value={form.frota} onChange={e => set("frota", e.target.value)} /></div>
        </div>
        <div><Label className="text-[11px] font-mono text-muted-foreground">Marcas Principais</Label><Input className="bg-background border-border mt-1 rounded-md" placeholder="Mercedes-Benz, Volks, Scania..." value={form.marcaPrincipal} onChange={e => set("marcaPrincipal", e.target.value)} /></div>
      </TabsContent>

      <TabsContent value="comercial" className="space-y-4 mt-4">
        <div>
          <Label className="text-[11px] font-mono text-muted-foreground">Score de Fidelidade: {score[0]}</Label>
          <Slider value={score} onValueChange={setScore} max={100} step={1} className="mt-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span className="text-destructive">0 - Baixo</span><span className="text-status-prospect">31 - Médio</span><span className="text-primary">61 - Alto</span>
          </div>
        </div>
        <div><Label className="text-[11px] font-mono text-muted-foreground">Concorrentes que Atende</Label><Textarea className="bg-background border-border mt-1 rounded-md" value={form.concorrentes} onChange={e => set("concorrentes", e.target.value)} /></div>
      </TabsContent>

      <TabsContent value="parceria" className="space-y-4 mt-4">
        <div><Label className="text-[11px] font-mono text-muted-foreground">Observações Contratuais</Label><Textarea className="bg-background border-border mt-1 rounded-md" value={form.obsParceria} onChange={e => set("obsParceria", e.target.value)} /></div>
      </TabsContent>

      <TabsContent value="obs" className="space-y-4 mt-4">
        <div><Label className="text-[11px] font-mono text-muted-foreground">Observações Gerais</Label><Textarea className="bg-transparent border-border/40 mt-1 min-h-[120px] rounded-xl" placeholder="Informações adicionais sobre o cliente..." value={form.observacoes} onChange={e => set("observacoes", e.target.value)} /></div>
        <div><Label className="text-[11px] font-mono text-muted-foreground">Tags</Label><Input className="bg-background border-border mt-1 rounded-md" placeholder="Separe por vírgula: tag1, tag2, tag3" value={form.tags} onChange={e => set("tags", e.target.value)} /></div>
      </TabsContent>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1 rounded-lg border-white/[0.08] bg-white/[0.03] text-foreground/50 hover:text-foreground" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button className="flex-1 rounded-md font-semibold" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Salvando...</> : "Salvar Cliente"}
        </Button>
      </div>
    </Tabs>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">{label}</span>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

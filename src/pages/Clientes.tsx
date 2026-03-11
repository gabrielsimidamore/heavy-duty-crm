import { useState } from "react";
import { clients, type Client, type ClientStatus, type TipoEmpresa } from "@/data/clients";
import { interactions } from "@/data/interactions";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, History, Plus, MessageCircle, LayoutGrid, List, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";

const statuses: ClientStatus[] = ["Ativo", "Lead", "Prospect", "Inativo", "Sem compras"];
const tipos: TipoEmpresa[] = ["Federações", "Locadoras", "Seguradoras", "Transportadora", "Associações", "Tecnologia"];

const kanbanColumns: { status: ClientStatus; color: string }[] = [
  { status: "Lead", color: "border-status-lead" },
  { status: "Prospect", color: "border-status-prospect" },
  { status: "Ativo", color: "border-status-ativo" },
  { status: "Inativo", color: "border-status-inativo" },
];

export default function Clientes() {
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
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Clientes</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8 rounded-xl"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8 rounded-xl"
            onClick={() => setViewMode("kanban")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Dialog open={showNewClient} onOpenChange={setShowNewClient}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs font-display rounded-xl">
                <Plus className="h-3 w-3 mr-1" /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto glass-elevated rounded-2xl border-0">
              <DialogHeader>
                <DialogTitle className="font-display text-lg">Novo Cliente</DialogTitle>
              </DialogHeader>
              <NewClientForm onClose={() => setShowNewClient(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap gap-3 items-center glass-subtle rounded-2xl p-3"
      >
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa ou CNPJ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-transparent border-border/50 text-sm rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-transparent border-border/50 text-sm rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="glass-elevated border-0 rounded-2xl">
            <SelectItem value="all">Todos Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[180px] bg-transparent border-border/50 text-sm rounded-xl">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="glass-elevated border-0 rounded-2xl">
            <SelectItem value="all">Todos Tipos</SelectItem>
            {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === "table" ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl overflow-auto"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  {["", "Contato", "Empresa", "Telefone", "E-mail", "Tipo", "Região", "Frota", "Status", "Score", "Ações"].map(h => (
                    <th key={h} className="text-left px-3 py-3 font-display text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="font-display text-sm uppercase tracking-wider">Nenhum cliente encontrado</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, idx) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.025 }}
                      onClick={() => setSelectedClient(c)}
                      className="border-b border-border/20 hover:bg-foreground/[0.03] cursor-pointer transition-all duration-200"
                    >
                      <td className="px-3 py-3">
                        <div className="w-8 h-8 rounded-full glass-subtle text-primary font-display text-xs flex items-center justify-center font-bold">
                          {c.contato.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium text-foreground whitespace-nowrap">{c.contato}</td>
                      <td className="px-3 py-3 text-foreground whitespace-nowrap">{c.empresa}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">{c.telefone}</td>
                      <td className="px-3 py-3 text-muted-foreground text-xs">{c.email}</td>
                      <td className="px-3 py-3 text-muted-foreground whitespace-nowrap text-xs">{c.tipoEmpresa}</td>
                      <td className="px-3 py-3 text-muted-foreground">{c.regiao}</td>
                      <td className="px-3 py-3 font-display text-muted-foreground">{c.frota ?? "—"}</td>
                      <td className="px-3 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-3 py-3 text-muted-foreground text-xs">{c.scoreFidelidade}</td>
                      <td className="px-3 py-3">
                        <Button variant="ghost" size="sm" className="text-xs h-7 rounded-lg" onClick={e => { e.stopPropagation(); setSelectedClient(c); }}>
                          Ver
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {kanbanColumns.map((col, colIdx) => (
              <motion.div
                key={col.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: colIdx * 0.08 }}
                className="space-y-3"
              >
                <div className={`flex items-center gap-2 pb-2 border-b-2 ${col.color}`}>
                  <StatusBadge status={col.status} />
                  <span className="text-xs text-muted-foreground">
                    ({filtered.filter(c => c.status === col.status).length})
                  </span>
                </div>
                {filtered.filter(c => c.status === col.status).map((c, idx) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: colIdx * 0.08 + idx * 0.04 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    onClick={() => setSelectedClient(c)}
                    className="glass glass-shimmer rounded-2xl p-3.5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full glass-subtle text-primary font-display text-[10px] flex items-center justify-center font-bold">
                        {c.contato.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{c.contato}</p>
                        <p className="text-xs text-muted-foreground">{c.empresa}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{c.tipoEmpresa}</span>
                      {c.frota && <span>• Frota: {c.frota}</span>}
                    </div>
                  </motion.div>
                ))}
                {filtered.filter(c => c.status === col.status).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-xs glass-subtle rounded-2xl">Nenhum cliente</div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client Detail Drawer */}
      <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <SheetContent className="glass-elevated border-l-0 w-[420px] sm:w-[480px] overflow-auto rounded-l-3xl">
          {selectedClient && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-12 h-12 rounded-full glass text-primary font-display text-lg flex items-center justify-center font-bold"
                  >
                    {selectedClient.contato.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </motion.div>
                  <div>
                    <SheetTitle className="font-display text-lg text-foreground">{selectedClient.contato}</SheetTitle>
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
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass-subtle rounded-2xl p-3.5"
                  >
                    <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm text-foreground">{selectedClient.observacoes}</p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-subtle rounded-2xl p-3.5"
                >
                  <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1">Interações Vinculadas</p>
                  <p className="font-display text-2xl font-bold text-primary">{clientInteractions.length}</p>
                  {clientInteractions.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Último contato: {formatDate(clientInteractions.sort((a, b) => b.date.localeCompare(a.date))[0].date)}
                    </p>
                  )}
                </motion.div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs border-border/30 hover:bg-foreground/5 rounded-xl">
                    <History className="h-3 w-3 mr-1" /> Ver Histórico
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs border-border/30 hover:bg-foreground/5 rounded-xl">
                    <Plus className="h-3 w-3 mr-1" /> Nova Interação
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs border-border/30 hover:bg-foreground/5 rounded-xl">
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}

function NewClientForm({ onClose }: { onClose: () => void }) {
  const [score, setScore] = useState([50]);

  return (
    <Tabs defaultValue="dados" className="w-full">
      <TabsList className="w-full glass-subtle rounded-xl">
        <TabsTrigger value="dados" className="flex-1 text-xs rounded-lg">Dados Gerais</TabsTrigger>
        <TabsTrigger value="frota" className="flex-1 text-xs rounded-lg">Frota</TabsTrigger>
        <TabsTrigger value="comercial" className="flex-1 text-xs rounded-lg">Comercial</TabsTrigger>
        <TabsTrigger value="parceria" className="flex-1 text-xs rounded-lg">Parceria</TabsTrigger>
        <TabsTrigger value="obs" className="flex-1 text-xs rounded-lg">Observações</TabsTrigger>
      </TabsList>

      <TabsContent value="dados" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Nome do Contato *</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
          <div><Label className="text-xs">Cargo</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
          <div><Label className="text-xs">Empresa *</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
          <div><Label className="text-xs">CNPJ</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" placeholder="00.000.000/0000-00" /></div>
          <div><Label className="text-xs">Telefone</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
          <div><Label className="text-xs">WhatsApp</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
          <div><Label className="text-xs">E-mail</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" type="email" /></div>
          <div><Label className="text-xs">Site</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" type="url" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Status *</Label>
            <Select><SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="glass-elevated border-0 rounded-2xl">
                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Tipo de Empresa *</Label>
            <Select><SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="glass-elevated border-0 rounded-2xl">
                {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Origem do Lead</Label>
            <Select><SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="glass-elevated border-0 rounded-2xl">
                {["Indicação", "LinkedIn", "E-mail Mkt", "Ligação", "Evento", "Site", "Outro"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Região de Atuação</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
        </div>
        <div>
          <Label className="text-xs">Endereço Completo</Label>
          <Textarea className="bg-transparent border-border/40 mt-1 min-h-[60px] rounded-xl" />
        </div>
      </TabsContent>

      <TabsContent value="frota" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          {["Quantidade Total de Veículos", "Caminhões Leves", "Caminhões Médios", "Caminhões Pesados", "Carretas", "Ônibus", "Vans/Utilitários", "Automóveis"].map(f => (
            <div key={f}><Label className="text-xs">{f}</Label><Input type="number" className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
          ))}
        </div>
        <div><Label className="text-xs">Marcas Principais</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" placeholder="Mercedes-Benz, Volks, Scania..." /></div>
        <div><Label className="text-xs">Ticket Médio Estimado (R$)</Label><Input type="number" className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
        <div><Label className="text-xs">Observações sobre Frota</Label><Textarea className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
      </TabsContent>

      <TabsContent value="comercial" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Potencial de Compra", options: ["Alto", "Médio", "Baixo"] },
            { label: "Forma de Pagamento", options: ["Boleto", "PIX", "Cartão", "A prazo", "Consignado"] },
            { label: "Nível de Relacionamento", options: ["Frio", "Morno", "Quente", "Parceiro Estratégico"] },
          ].map(sel => (
            <div key={sel.label}>
              <Label className="text-xs">{sel.label}</Label>
              <Select><SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="glass-elevated border-0 rounded-2xl">
                  {sel.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div><Label className="text-xs">Desconto Máximo (%)</Label><Input type="number" className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
        </div>
        <div>
          <Label className="text-xs">Score de Fidelidade: {score[0]}</Label>
          <Slider value={score} onValueChange={setScore} max={100} step={1} className="mt-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span className="text-destructive">0 - Baixo</span>
            <span className="text-status-prospect">31 - Médio</span>
            <span className="text-primary">61 - Alto</span>
          </div>
        </div>
        <div><Label className="text-xs">Concorrentes que Atende</Label><Textarea className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
      </TabsContent>

      <TabsContent value="parceria" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Tipo de Parceria", options: ["Cliente direto", "Parceiro comercial", "Indicador", "Associação representada", "Plataforma"] },
            { label: "Status do Contrato", options: ["Sem contrato", "Em negociação", "Contrato enviado", "Aguardando Jurídico", "Assinado", "Encerrado"] },
          ].map(sel => (
            <div key={sel.label}>
              <Label className="text-xs">{sel.label}</Label>
              <Select><SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="glass-elevated border-0 rounded-2xl">
                  {sel.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div><Label className="text-xs">Comissão/Repasse (%)</Label><Input type="number" className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
          <div><Label className="text-xs">Número do Contrato</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
        </div>
        <div><Label className="text-xs">Observações Contratuais</Label><Textarea className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
      </TabsContent>

      <TabsContent value="obs" className="space-y-4 mt-4">
        <div>
          <Label className="text-xs">Observações Gerais</Label>
          <Textarea className="bg-transparent border-border/40 mt-1 min-h-[120px] rounded-xl" placeholder="Informações adicionais sobre o cliente..." />
        </div>
        <div>
          <Label className="text-xs">Tags</Label>
          <Input className="bg-transparent border-border/40 mt-1 rounded-xl" placeholder="Separe por vírgula: tag1, tag2, tag3" />
        </div>
        <div className="border border-dashed border-border/30 rounded-2xl p-8 text-center text-muted-foreground hover:border-primary/20 transition-colors glass-subtle">
          <p className="text-sm">Arraste arquivos aqui ou clique para selecionar</p>
          <p className="text-xs mt-1">PDF, DOCX, XLSX, PNG, JPG, WebP</p>
        </div>
      </TabsContent>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1 rounded-xl border-border/30" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1 font-display rounded-xl" onClick={onClose}>Salvar Cliente</Button>
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

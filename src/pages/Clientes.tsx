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
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Clientes</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("kanban")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Dialog open={showNewClient} onOpenChange={setShowNewClient}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs font-display">
                <Plus className="h-3 w-3 mr-1" /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto bg-popover border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-lg">Novo Cliente</DialogTitle>
              </DialogHeader>
              <NewClientForm onClose={() => setShowNewClient(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa ou CNPJ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-card border-border text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Todos Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tipoFilter} onValueChange={setTipoFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border text-sm">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Todos Tipos</SelectItem>
            {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {viewMode === "table" ? (
        <div className="border border-border rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                {["", "Contato", "Empresa", "Telefone", "E-mail", "Tipo", "Região", "Frota", "Status", "Score", "Ações"].map(h => (
                  <th key={h} className="text-left px-3 py-2 font-display text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
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
                filtered.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedClient(c)}
                    className="border-b border-border hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-display text-xs flex items-center justify-center font-bold">
                        {c.contato.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{c.contato}</td>
                    <td className="px-3 py-2.5 text-foreground whitespace-nowrap">{c.empresa}</td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{c.telefone}</td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">{c.email}</td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap text-xs">{c.tipoEmpresa}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{c.regiao}</td>
                    <td className="px-3 py-2.5 font-display text-muted-foreground">{c.frota ?? "—"}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={c.status} /></td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">{c.scoreFidelidade}</td>
                    <td className="px-3 py-2.5">
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={e => { e.stopPropagation(); setSelectedClient(c); }}>
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map(col => (
            <div key={col.status} className="space-y-3">
              <div className={`flex items-center gap-2 pb-2 border-b-2 ${col.color}`}>
                <StatusBadge status={col.status} />
                <span className="text-xs text-muted-foreground">
                  ({filtered.filter(c => c.status === col.status).length})
                </span>
              </div>
              {filtered.filter(c => c.status === col.status).map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedClient(c)}
                  className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-display text-[10px] flex items-center justify-center font-bold">
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
                </div>
              ))}
              {filtered.filter(c => c.status === col.status).length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-xs">Nenhum cliente</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Client Detail Drawer */}
      <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <SheetContent className="bg-popover border-l border-border w-[420px] sm:w-[480px] overflow-auto">
          {selectedClient && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-display text-lg flex items-center justify-center font-bold">
                    {selectedClient.contato.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
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
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-1">Observações</p>
                    <p className="text-sm text-foreground">{selectedClient.observacoes}</p>
                  </div>
                )}

                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-1">Interações Vinculadas</p>
                  <p className="font-display text-2xl font-bold text-primary">{clientInteractions.length}</p>
                  {clientInteractions.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Último contato: {formatDate(clientInteractions.sort((a, b) => b.date.localeCompare(a.date))[0].date)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs border-border hover:bg-secondary">
                    <History className="h-3 w-3 mr-1" /> Ver Histórico
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs border-border hover:bg-secondary">
                    <Plus className="h-3 w-3 mr-1" /> Nova Interação
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs border-border hover:bg-secondary">
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NewClientForm({ onClose }: { onClose: () => void }) {
  const [score, setScore] = useState([50]);

  return (
    <Tabs defaultValue="dados" className="w-full">
      <TabsList className="w-full bg-secondary">
        <TabsTrigger value="dados" className="flex-1 text-xs">Dados Gerais</TabsTrigger>
        <TabsTrigger value="frota" className="flex-1 text-xs">Frota</TabsTrigger>
        <TabsTrigger value="comercial" className="flex-1 text-xs">Comercial</TabsTrigger>
        <TabsTrigger value="parceria" className="flex-1 text-xs">Parceria</TabsTrigger>
        <TabsTrigger value="obs" className="flex-1 text-xs">Observações</TabsTrigger>
      </TabsList>

      <TabsContent value="dados" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Nome do Contato *</Label><Input className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">Cargo</Label><Input className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">Empresa *</Label><Input className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">CNPJ</Label><Input className="bg-card border-border mt-1" placeholder="00.000.000/0000-00" /></div>
          <div><Label className="text-xs">Telefone</Label><Input className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">WhatsApp</Label><Input className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">E-mail</Label><Input className="bg-card border-border mt-1" type="email" /></div>
          <div><Label className="text-xs">Site</Label><Input className="bg-card border-border mt-1" type="url" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Status *</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Tipo de Empresa *</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Origem do Lead</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["Indicação", "LinkedIn", "E-mail Mkt", "Ligação", "Evento", "Site", "Outro"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Região de Atuação</Label><Input className="bg-card border-border mt-1" /></div>
        </div>
        <div>
          <Label className="text-xs">Endereço Completo</Label>
          <Textarea className="bg-card border-border mt-1 min-h-[60px]" />
        </div>
      </TabsContent>

      <TabsContent value="frota" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Quantidade Total de Veículos</Label><Input type="number" className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">Caminhões Leves</Label><Input type="number" className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">Caminhões Médios</Label><Input type="number" className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">Caminhões Pesados</Label><Input type="number" className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">Carretas</Label><Input type="number" className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">Ônibus</Label><Input type="number" className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">Vans/Utilitários</Label><Input type="number" className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">Automóveis</Label><Input type="number" className="bg-card border-border mt-1" /></div>
        </div>
        <div>
          <Label className="text-xs">Marcas Principais</Label>
          <Input className="bg-card border-border mt-1" placeholder="Mercedes-Benz, Volks, Scania..." />
        </div>
        <div>
          <Label className="text-xs">Ticket Médio Estimado (R$)</Label>
          <Input type="number" className="bg-card border-border mt-1" />
        </div>
        <div>
          <Label className="text-xs">Observações sobre Frota</Label>
          <Textarea className="bg-card border-border mt-1" />
        </div>
      </TabsContent>

      <TabsContent value="comercial" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Potencial de Compra</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["Alto", "Médio", "Baixo"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Forma de Pagamento</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["Boleto", "PIX", "Cartão", "A prazo", "Consignado"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Nível de Relacionamento</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["Frio", "Morno", "Quente", "Parceiro Estratégico"].map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Desconto Máximo (%)</Label><Input type="number" className="bg-card border-border mt-1" /></div>
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
        <div><Label className="text-xs">Concorrentes que Atende</Label><Textarea className="bg-card border-border mt-1" /></div>
      </TabsContent>

      <TabsContent value="parceria" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Tipo de Parceria</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["Cliente direto", "Parceiro comercial", "Indicador", "Associação representada", "Plataforma"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Status do Contrato</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["Sem contrato", "Em negociação", "Contrato enviado", "Aguardando Jurídico", "Assinado", "Encerrado"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Comissão/Repasse (%)</Label><Input type="number" className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">Número do Contrato</Label><Input className="bg-card border-border mt-1" /></div>
        </div>
        <div><Label className="text-xs">Observações Contratuais</Label><Textarea className="bg-card border-border mt-1" /></div>
      </TabsContent>

      <TabsContent value="obs" className="space-y-4 mt-4">
        <div>
          <Label className="text-xs">Observações Gerais</Label>
          <Textarea className="bg-card border-border mt-1 min-h-[120px]" placeholder="Informações adicionais sobre o cliente..." />
        </div>
        <div>
          <Label className="text-xs">Tags</Label>
          <Input className="bg-card border-border mt-1" placeholder="Separe por vírgula: tag1, tag2, tag3" />
        </div>
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
          <p className="text-sm">Arraste arquivos aqui ou clique para selecionar</p>
          <p className="text-xs mt-1">PDF, DOCX, XLSX, PNG, JPG, WebP</p>
        </div>
      </TabsContent>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1 font-display" onClick={onClose}>Salvar Cliente</Button>
      </div>
    </Tabs>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">{label}</span>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

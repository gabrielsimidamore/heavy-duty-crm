import { useState } from "react";
import { clients, type Client, type ClientStatus, type TipoEmpresa } from "@/data/clients";
import { interactions } from "@/data/interactions";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, MessageCircle, History, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Clientes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tipoFilter, setTipoFilter] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filtered = clients.filter(c => {
    const matchSearch = !search || c.contato.toLowerCase().includes(search.toLowerCase()) || c.empresa.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchTipo = tipoFilter === "all" || c.tipoEmpresa === tipoFilter;
    return matchSearch && matchStatus && matchTipo;
  });

  const clientInteractions = selectedClient
    ? interactions.filter(i => i.clientId === selectedClient.id)
    : [];

  const statuses: ClientStatus[] = ["Ativo", "Lead", "Prospect", "Inativo", "Sem compras"];
  const tipos: TipoEmpresa[] = ["Federações", "Locadoras", "Seguradoras", "Transportadora", "Associações", "Tecnologia"];

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Clientes</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border font-body text-sm"
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

      {/* Table */}
      <div className="border border-border rounded-sm overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/50 border-b border-border">
              {["ID", "Contato", "Empresa", "Telefone", "E-mail", "Tipo Empresa", "Região", "Frota", "Status", "Score"].map(h => (
                <th key={h} className="text-left px-3 py-2 font-display text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 font-display text-sm uppercase tracking-wider text-muted-foreground">
                  [ ERRO: 0 RESULTADOS ]
                </td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedClient(c)}
                  className="border-b border-border hover:bg-secondary/30 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2.5 font-display text-muted-foreground">{c.id}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{c.contato}</td>
                  <td className="px-3 py-2.5 text-foreground whitespace-nowrap">{c.empresa}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{c.telefone}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{c.email}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{c.tipoEmpresa}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{c.regiao}</td>
                  <td className="px-3 py-2.5 font-display text-muted-foreground">{c.frota ?? "—"}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={c.status} /></td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{c.scoreFidelidade}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Client Detail Drawer */}
      <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <SheetContent className="bg-popover border-l border-border w-[400px] sm:w-[440px] overflow-auto">
          {selectedClient && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-lg text-foreground">{selectedClient.contato}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <StatusBadge status={selectedClient.status} />
                  <DetailRow label="Empresa" value={selectedClient.empresa} />
                  <DetailRow label="Telefone" value={selectedClient.telefone} />
                  <DetailRow label="E-mail" value={selectedClient.email} />
                  <DetailRow label="Tipo" value={selectedClient.tipoEmpresa} />
                  <DetailRow label="Região" value={selectedClient.regiao} />
                  <DetailRow label="Frota" value={selectedClient.frota?.toString() ?? "—"} />
                  <DetailRow label="Marca Principal" value={selectedClient.marcaPrincipal} />
                  <DetailRow label="Score" value={selectedClient.scoreFidelidade} />
                  {selectedClient.cnpj && <DetailRow label="CNPJ" value={selectedClient.cnpj} />}
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-1">
                    Interações Vinculadas
                  </p>
                  <p className="font-display text-xl font-bold text-primary">{clientInteractions.length}</p>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-display uppercase tracking-wider text-muted-foreground min-w-[80px]">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

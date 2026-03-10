import { useState } from "react";
import { sales, type Sale, type SaleStatus } from "@/data/sales";
import { clients } from "@/data/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, DollarSign, TrendingUp, ShoppingCart, Percent, Paperclip, Trash2 } from "lucide-react";

const statusStyles: Record<SaleStatus, string> = {
  "Cotação enviada": "bg-status-lead/15 text-status-lead border-status-lead/30",
  "Em negociação": "bg-status-prospect/15 text-status-prospect border-status-prospect/30",
  "Pedido confirmado": "bg-primary/15 text-primary border-primary/30",
  "Faturado": "bg-green-500/15 text-green-400 border-green-500/30",
  "Entregue": "bg-teal-500/15 text-teal-400 border-teal-500/30",
  "Cancelado": "bg-destructive/15 text-destructive border-destructive/30",
  "Perda": "bg-status-inativo/15 text-status-inativo border-status-inativo/30",
};

export default function Vendas() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showNewSale, setShowNewSale] = useState(false);

  const filtered = sales.filter(s => {
    const matchSearch = !search || s.clientName.toLowerCase().includes(search.toLowerCase()) || s.empresa.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalVendas = sales.reduce((sum, s) => sum + s.totalValue, 0);
  const ticketMedio = totalVendas / (sales.length || 1);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Vendas / Pedidos / Cotações</h1>
        <Dialog open={showNewSale} onOpenChange={setShowNewSale}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs font-display">
              <Plus className="h-3 w-3 mr-1" /> Nova Venda / Cotação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto bg-popover border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Nova Venda / Cotação</DialogTitle>
            </DialogHeader>
            <NewSaleForm onClose={() => setShowNewSale(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-display uppercase tracking-wider">
            <DollarSign className="h-3.5 w-3.5 text-primary" /> Total Vendas
          </div>
          <p className="font-display text-xl font-bold text-foreground mt-1">R$ {totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-display uppercase tracking-wider">
            <ShoppingCart className="h-3.5 w-3.5 text-primary" /> Pedidos
          </div>
          <p className="font-display text-xl font-bold text-foreground mt-1">{sales.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-display uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5 text-primary" /> Ticket Médio
          </div>
          <p className="font-display text-xl font-bold text-foreground mt-1">R$ {ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-display uppercase tracking-wider">
            <Percent className="h-3.5 w-3.5 text-primary" /> Conversão
          </div>
          <p className="font-display text-xl font-bold text-foreground mt-1">
            {Math.round((sales.filter(s => ["Pedido confirmado", "Faturado", "Entregue"].includes(s.status)).length / (sales.length || 1)) * 100)}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] bg-card border-border text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">Todos</SelectItem>
            {(Object.keys(statusStyles) as SaleStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/50 border-b border-border">
              {["Nº", "Cliente", "Empresa", "Data", "Pedido", "Produtos", "Total", "Pgto", "Status"].map(h => (
                <th key={h} className="text-left px-3 py-2 font-display text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="font-display text-sm uppercase tracking-wider">Nenhuma venda encontrada</p>
                </td>
              </tr>
            ) : (
              filtered.map(s => (
                <tr key={s.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-3 py-2.5 font-display text-muted-foreground">{s.id}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{s.clientName}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{s.empresa}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{formatDate(s.date)}</td>
                  <td className="px-3 py-2.5 font-display text-xs text-muted-foreground">{s.numeroPedido}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{s.produtos.length} item(s)</td>
                  <td className="px-3 py-2.5 font-display font-medium text-foreground whitespace-nowrap">R$ {s.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{s.formaPagamento}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium font-display uppercase tracking-wider border rounded-full ${statusStyles[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewSaleForm({ onClose }: { onClose: () => void }) {
  const [products, setProducts] = useState([{ codigo: "", descricao: "", marca: "", quantidade: 1, valorUnit: 0, desconto: 0 }]);
  const uniqueClients = Array.from(new Map(clients.map(c => [c.id, c])).values());

  const addProduct = () => setProducts([...products, { codigo: "", descricao: "", marca: "", quantidade: 1, valorUnit: 0, desconto: 0 }]);
  const removeProduct = (idx: number) => setProducts(products.filter((_, i) => i !== idx));

  const total = products.reduce((sum, p) => sum + p.quantidade * p.valorUnit * (1 - p.desconto / 100), 0);

  return (
    <Tabs defaultValue="pedido" className="w-full">
      <TabsList className="w-full bg-secondary">
        <TabsTrigger value="pedido" className="flex-1 text-xs">Dados do Pedido</TabsTrigger>
        <TabsTrigger value="produtos" className="flex-1 text-xs">Produtos</TabsTrigger>
        <TabsTrigger value="condicoes" className="flex-1 text-xs">Condições</TabsTrigger>
        <TabsTrigger value="docs" className="flex-1 text-xs">Documentos</TabsTrigger>
        <TabsTrigger value="pos" className="flex-1 text-xs">Pós-Venda</TabsTrigger>
      </TabsList>

      <TabsContent value="pedido" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Cliente *</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {uniqueClients.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.contato} — {c.empresa}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Data *</Label><Input type="date" className="bg-card border-border mt-1" defaultValue="2026-03-10" /></div>
          <div><Label className="text-xs">Nº Pedido</Label><Input className="bg-card border-border mt-1" placeholder="Auto ou manual" /></div>
          <div>
            <Label className="text-xs">Tipo *</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["Cotação", "Pedido", "Venda direta", "Devolução"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Status *</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["Cotação enviada", "Em negociação", "Pedido confirmado", "Faturado", "Entregue", "Cancelado", "Perda"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="produtos" className="space-y-4 mt-4">
        {products.map((p, idx) => (
          <div key={idx} className="grid grid-cols-7 gap-2 items-end">
            <div><Label className="text-[10px]">Código</Label><Input className="bg-card border-border mt-1 text-xs" value={p.codigo} onChange={e => { const np = [...products]; np[idx].codigo = e.target.value; setProducts(np); }} /></div>
            <div className="col-span-2"><Label className="text-[10px]">Descrição</Label><Input className="bg-card border-border mt-1 text-xs" value={p.descricao} onChange={e => { const np = [...products]; np[idx].descricao = e.target.value; setProducts(np); }} /></div>
            <div><Label className="text-[10px]">Qtd</Label><Input type="number" className="bg-card border-border mt-1 text-xs" value={p.quantidade} onChange={e => { const np = [...products]; np[idx].quantidade = Number(e.target.value); setProducts(np); }} /></div>
            <div><Label className="text-[10px]">Valor Unit</Label><Input type="number" className="bg-card border-border mt-1 text-xs" value={p.valorUnit} onChange={e => { const np = [...products]; np[idx].valorUnit = Number(e.target.value); setProducts(np); }} /></div>
            <div><Label className="text-[10px]">Desc %</Label><Input type="number" className="bg-card border-border mt-1 text-xs" value={p.desconto} onChange={e => { const np = [...products]; np[idx].desconto = Number(e.target.value); setProducts(np); }} /></div>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeProduct(idx)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addProduct} className="text-xs">
          <Plus className="h-3 w-3 mr-1" /> Adicionar Produto
        </Button>
        <div className="bg-secondary/30 rounded-lg p-3 text-right">
          <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">Total: </span>
          <span className="font-display text-lg font-bold text-primary">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </div>
      </TabsContent>

      <TabsContent value="condicoes" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Forma de Pagamento</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["Boleto", "PIX", "Cartão", "A prazo", "Consignado"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Prazo</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["À vista", "7d", "14d", "21d", "28d", "30d", "45d", "60d"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Desconto Total (%)</Label><Input type="number" className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">Vendedor</Label><Input className="bg-card border-border mt-1" defaultValue="Junior Pinheiro" /></div>
        </div>
        <div><Label className="text-xs">Observações de Negociação</Label><Textarea className="bg-card border-border mt-1" /></div>
      </TabsContent>

      <TabsContent value="docs" className="space-y-4 mt-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
          <Paperclip className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Arraste arquivos ou cole prints (Ctrl+V)</p>
          <p className="text-xs mt-1">PNG, JPG, WebP, PDF, DOCX, XLSX</p>
        </div>
      </TabsContent>

      <TabsContent value="pos" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Data Entrega Prevista</Label><Input type="date" className="bg-card border-border mt-1" /></div>
          <div><Label className="text-xs">Data Entrega Realizada</Label><Input type="date" className="bg-card border-border mt-1" /></div>
          <div>
            <Label className="text-xs">Status de Entrega</Label>
            <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {["Aguardando", "Em separação", "Despachado", "Entregue", "Problema"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Concorrente que Ganhou</Label><Input className="bg-card border-border mt-1" /></div>
        </div>
        <div><Label className="text-xs">Motivo da Perda</Label><Textarea className="bg-card border-border mt-1" /></div>
        <div><Label className="text-xs">Observações Finais</Label><Textarea className="bg-card border-border mt-1" /></div>
      </TabsContent>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1 font-display" onClick={onClose}>Salvar</Button>
      </div>
    </Tabs>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

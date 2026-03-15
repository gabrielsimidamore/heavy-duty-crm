import { useState } from "react";
import { type Sale, type SaleStatus } from "@/data/sales";
import { useClients } from "@/hooks/useClients";
import { useSales } from "@/hooks/useSales";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, DollarSign, TrendingUp, ShoppingCart, Percent, Paperclip, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const statusStyles: Record<SaleStatus, string> = {
  "Cotação enviada": "bg-status-lead/10 text-status-lead border-status-lead/20",
  "Em negociação": "bg-status-prospect/10 text-status-prospect border-status-prospect/20",
  "Pedido confirmado": "bg-primary/10 text-primary border-primary/20",
  "Faturado": "bg-green-500/10 text-green-400 border-green-500/20",
  "Entregue": "bg-teal-500/10 text-teal-400 border-teal-500/20",
  "Cancelado": "bg-destructive/10 text-destructive border-destructive/20",
  "Perda": "bg-status-inativo/10 text-status-inativo border-status-inativo/20",
};

export default function Vendas() {
  const { sales, loading } = useSales();
  const { clients } = useClients();
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
        <h1 className="text-xl font-bold text-foreground font-display">Vendas / Pedidos / Cotações</h1>
        <Dialog open={showNewSale} onOpenChange={setShowNewSale}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs font-display rounded-xl">
              <Plus className="h-3 w-3 mr-1" /> Nova Venda / Cotação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto card-elevated border-border/60 rounded-xl">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Nova Venda / Cotação</DialogTitle>
            </DialogHeader>
            <NewSaleForm onClose={() => setShowNewSale(false)} />
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: DollarSign, label: "Total Vendas", value: `R$ ${totalVendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
          { icon: ShoppingCart, label: "Pedidos", value: sales.length },
          { icon: TrendingUp, label: "Ticket Médio", value: `R$ ${ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
          { icon: Percent, label: "Conversão", value: `${Math.round((sales.filter(s => ["Pedido confirmado", "Faturado", "Entregue"].includes(s.status)).length / (sales.length || 1)) * 100)}%` },
        ].map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.06 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="card-surface rounded-xl p-3.5"
          >
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-display uppercase tracking-wider">
              <kpi.icon className="h-3.5 w-3.5 text-primary" /> {kpi.label}
            </div>
            <p className="font-display text-xl font-bold text-foreground mt-1">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-3 items-center card-surface rounded-xl p-3"
      >
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white/[0.03] border-border/60 text-xs rounded-lg" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] bg-white/[0.03] border-border/60 text-xs rounded-lg">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="card-elevated border-border/60 rounded-xl">
            <SelectItem value="all">Todos</SelectItem>
            {(Object.keys(statusStyles) as SaleStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <table className="w-full text-xs" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "4%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "7%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-border/30">
              {["Nº", "Cliente", "Empresa", "Data", "Pedido", "Itens", "Total", "Pgto", "Status"].map(h => (
                <th key={h} className="text-left px-3 py-3 font-display text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
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
              filtered.map((s, idx) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  className="border-b border-border/20 hover:bg-foreground/[0.03] transition-colors"
                >
                  <td className="px-3 py-2.5 text-muted-foreground">{s.id}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground"><span className="block truncate">{s.clientName}</span></td>
                  <td className="px-3 py-2.5 text-muted-foreground"><span className="block truncate">{s.empresa}</span></td>
                  <td className="px-3 py-2.5 text-muted-foreground">{formatDate(s.date)}</td>
                  <td className="px-3 py-2.5 text-muted-foreground"><span className="block truncate">{s.numeroPedido}</span></td>
                  <td className="px-3 py-2.5 text-muted-foreground text-center">{s.produtos.length}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground"><span className="block truncate">R$ {s.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></td>
                  <td className="px-3 py-2.5 text-muted-foreground"><span className="block truncate">{s.formaPagamento}</span></td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium font-display uppercase tracking-wider border rounded-full ${statusStyles[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
}

function NewSaleForm({ onClose }: { onClose: () => void }) {
  const [products, setProducts] = useState([{ codigo: "", descricao: "", marca: "", quantidade: 1, valorUnit: 0, desconto: 0 }]);
  const { clients } = useClients();
  const uniqueClients = Array.from(new Map(clients.map(c => [c.id, c])).values());

  const addProduct = () => setProducts([...products, { codigo: "", descricao: "", marca: "", quantidade: 1, valorUnit: 0, desconto: 0 }]);
  const removeProduct = (idx: number) => setProducts(products.filter((_, i) => i !== idx));

  const total = products.reduce((sum, p) => sum + p.quantidade * p.valorUnit * (1 - p.desconto / 100), 0);

  return (
    <Tabs defaultValue="pedido" className="w-full">
      <TabsList className="w-full glass-subtle rounded-xl">
        <TabsTrigger value="pedido" className="flex-1 text-xs rounded-lg">Dados do Pedido</TabsTrigger>
        <TabsTrigger value="produtos" className="flex-1 text-xs rounded-lg">Produtos</TabsTrigger>
        <TabsTrigger value="condicoes" className="flex-1 text-xs rounded-lg">Condições</TabsTrigger>
        <TabsTrigger value="docs" className="flex-1 text-xs rounded-lg">Documentos</TabsTrigger>
        <TabsTrigger value="pos" className="flex-1 text-xs rounded-lg">Pós-Venda</TabsTrigger>
      </TabsList>

      <TabsContent value="pedido" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Cliente *</Label>
            <Select><SelectTrigger className="bg-white/[0.03] border-border/60 mt-1 rounded-lg"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="card-elevated border-border/60 rounded-xl">
                {uniqueClients.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.contato} — {c.empresa}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Data *</Label><Input type="date" className="bg-white/[0.03] border-border/60 mt-1 rounded-lg" defaultValue="2026-03-10" /></div>
          <div><Label className="text-xs">Nº Pedido</Label><Input className="bg-white/[0.03] border-border/60 mt-1 rounded-lg" placeholder="Auto ou manual" /></div>
          <div>
            <Label className="text-xs">Tipo *</Label>
            <Select><SelectTrigger className="bg-white/[0.03] border-border/60 mt-1 rounded-lg"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="card-elevated border-border/60 rounded-xl">
                {["Cotação", "Pedido", "Venda direta", "Devolução"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Status *</Label>
            <Select><SelectTrigger className="bg-white/[0.03] border-border/60 mt-1 rounded-lg"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="card-elevated border-border/60 rounded-xl">
                {["Cotação enviada", "Em negociação", "Pedido confirmado", "Faturado", "Entregue", "Cancelado", "Perda"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="produtos" className="space-y-4 mt-4">
        {products.map((p, idx) => (
          <div key={idx} className="grid grid-cols-7 gap-2 items-end">
            <div><Label className="text-[10px]">Código</Label><Input className="bg-transparent border-border/40 mt-1 text-xs rounded-xl" value={p.codigo} onChange={e => { const np = [...products]; np[idx].codigo = e.target.value; setProducts(np); }} /></div>
            <div className="col-span-2"><Label className="text-[10px]">Descrição</Label><Input className="bg-transparent border-border/40 mt-1 text-xs rounded-xl" value={p.descricao} onChange={e => { const np = [...products]; np[idx].descricao = e.target.value; setProducts(np); }} /></div>
            <div><Label className="text-[10px]">Qtd</Label><Input type="number" className="bg-transparent border-border/40 mt-1 text-xs rounded-xl" value={p.quantidade} onChange={e => { const np = [...products]; np[idx].quantidade = Number(e.target.value); setProducts(np); }} /></div>
            <div><Label className="text-[10px]">Valor Unit</Label><Input type="number" className="bg-transparent border-border/40 mt-1 text-xs rounded-xl" value={p.valorUnit} onChange={e => { const np = [...products]; np[idx].valorUnit = Number(e.target.value); setProducts(np); }} /></div>
            <div><Label className="text-[10px]">Desc %</Label><Input type="number" className="bg-transparent border-border/40 mt-1 text-xs rounded-xl" value={p.desconto} onChange={e => { const np = [...products]; np[idx].desconto = Number(e.target.value); setProducts(np); }} /></div>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive rounded-xl" onClick={() => removeProduct(idx)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addProduct} className="text-xs rounded-xl border-border/30">
          <Plus className="h-3 w-3 mr-1" /> Adicionar Produto
        </Button>
        <div className="bg-white/[0.03] border border-border/40 rounded-lg p-3 text-right">
          <span className="text-xs text-muted-foreground font-display uppercase tracking-wider">Total: </span>
          <span className="font-display text-lg font-bold text-primary">R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </div>
      </TabsContent>

      <TabsContent value="condicoes" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Forma de Pagamento", options: ["Boleto", "PIX", "Cartão", "A prazo", "Consignado"] },
            { label: "Prazo", options: ["À vista", "7d", "14d", "21d", "28d", "30d", "45d", "60d"] },
          ].map(sel => (
            <div key={sel.label}>
              <Label className="text-xs">{sel.label}</Label>
              <Select><SelectTrigger className="bg-white/[0.03] border-border/60 mt-1 rounded-lg"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent className="card-elevated border-border/60 rounded-xl">
                  {sel.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div><Label className="text-xs">Desconto Total (%)</Label><Input type="number" className="bg-white/[0.03] border-border/60 mt-1 rounded-lg" /></div>
          <div><Label className="text-xs">Vendedor</Label><Input className="bg-white/[0.03] border-border/60 mt-1 rounded-lg" defaultValue="Junior Pinheiro" /></div>
        </div>
        <div><Label className="text-xs">Observações de Negociação</Label><Textarea className="bg-white/[0.03] border-border/60 mt-1 rounded-lg" /></div>
      </TabsContent>

      <TabsContent value="docs" className="space-y-4 mt-4">
        <div className="border border-dashed border-border/30 rounded-2xl p-8 text-center text-muted-foreground glass-subtle hover:border-primary/20 transition-colors">
          <Paperclip className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Arraste arquivos ou cole prints (Ctrl+V)</p>
          <p className="text-xs mt-1">PNG, JPG, WebP, PDF, DOCX, XLSX</p>
        </div>
      </TabsContent>

      <TabsContent value="pos" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label className="text-xs">Data Entrega Prevista</Label><Input type="date" className="bg-white/[0.03] border-border/60 mt-1 rounded-lg" /></div>
          <div><Label className="text-xs">Data Entrega Realizada</Label><Input type="date" className="bg-white/[0.03] border-border/60 mt-1 rounded-lg" /></div>
          <div>
            <Label className="text-xs">Status de Entrega</Label>
            <Select><SelectTrigger className="bg-white/[0.03] border-border/60 mt-1 rounded-lg"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="card-elevated border-border/60 rounded-xl">
                {["Aguardando", "Em separação", "Despachado", "Entregue", "Problema"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Concorrente que Ganhou</Label><Input className="bg-white/[0.03] border-border/60 mt-1 rounded-lg" /></div>
        </div>
        <div><Label className="text-xs">Motivo da Perda</Label><Textarea className="bg-white/[0.03] border-border/60 mt-1 rounded-lg" /></div>
        <div><Label className="text-xs">Observações Finais</Label><Textarea className="bg-white/[0.03] border-border/60 mt-1 rounded-lg" /></div>
      </TabsContent>

      <div className="flex gap-2 mt-6">
        <Button variant="outline" className="flex-1 rounded-xl border-border/30" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1 font-display rounded-xl" onClick={onClose}>Salvar</Button>
      </div>
    </Tabs>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

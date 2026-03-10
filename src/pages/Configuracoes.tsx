import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clients } from "@/data/clients";
import { interactions } from "@/data/interactions";
import { sales } from "@/data/sales";
import { projects } from "@/data/projects";
import { User, Building2, Tags, Bell, Download, Database } from "lucide-react";
import { toast } from "sonner";

export default function Configuracoes() {
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(","), ...data.map(row => headers.map(h => `"${String((row as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename}.csv exportado com sucesso!`);
  };

  const exportJSON = () => {
    const allData = { clients, interactions, sales, projects };
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crm_backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup JSON exportado com sucesso!");
  };

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Configurações</h1>

      <Tabs defaultValue="perfil">
        <TabsList className="bg-secondary">
          <TabsTrigger value="perfil" className="text-xs"><User className="h-3 w-3 mr-1" /> Perfil</TabsTrigger>
          <TabsTrigger value="empresa" className="text-xs"><Building2 className="h-3 w-3 mr-1" /> Empresa</TabsTrigger>
          <TabsTrigger value="categorias" className="text-xs"><Tags className="h-3 w-3 mr-1" /> Categorias</TabsTrigger>
          <TabsTrigger value="notificacoes" className="text-xs"><Bell className="h-3 w-3 mr-1" /> Notificações</TabsTrigger>
          <TabsTrigger value="exportar" className="text-xs"><Download className="h-3 w-3 mr-1" /> Exportar</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary font-display text-xl flex items-center justify-center font-bold">JP</div>
            <div>
              <p className="font-display font-bold text-foreground">Junior Pinheiro</p>
              <p className="text-sm text-muted-foreground">Executivo Comercial</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Nome</Label><Input className="bg-card border-border mt-1" defaultValue="Junior Pinheiro" /></div>
            <div><Label className="text-xs">Cargo</Label><Input className="bg-card border-border mt-1" defaultValue="Executivo Comercial" /></div>
            <div><Label className="text-xs">E-mail</Label><Input className="bg-card border-border mt-1" defaultValue="junior@morelate.com.br" /></div>
            <div><Label className="text-xs">Telefone</Label><Input className="bg-card border-border mt-1" /></div>
          </div>
          <Button className="font-display">Salvar Perfil</Button>
        </TabsContent>

        <TabsContent value="empresa" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Nome da Empresa</Label><Input className="bg-card border-border mt-1" defaultValue="Morelate" /></div>
            <div><Label className="text-xs">CNPJ</Label><Input className="bg-card border-border mt-1" /></div>
            <div className="col-span-2"><Label className="text-xs">Endereço</Label><Input className="bg-card border-border mt-1" /></div>
          </div>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground">
            <p className="text-xs">Arraste o logo da empresa aqui</p>
          </div>
          <Button className="font-display">Salvar Empresa</Button>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4 mt-4">
          {[
            { label: "Tipos de Empresa", items: ["Federação", "Associação", "Locadora", "Seguradora", "Transportadora", "Tecnologia", "Distribuidora", "Revendedor", "Oficina", "Frota Própria"] },
            { label: "Status de Cliente", items: ["Ativo", "Lead", "Prospect", "Inativo", "Sem compras"] },
            { label: "Linhas de Peças", items: ["Motor", "Suspensão", "Freios", "Elétrica", "Lataria", "Filtros", "Transmissão", "Eixos", "Escapamento"] },
            { label: "Marcas", items: ["Mercedes-Benz", "Volks", "Scania", "Iveco", "Volvo", "DAF", "MAN", "Ford"] },
          ].map(cat => (
            <div key={cat.label} className="bg-card border border-border rounded-lg p-4">
              <p className="font-display text-xs uppercase tracking-wider text-muted-foreground mb-2">{cat.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map(item => (
                  <span key={item} className="text-xs px-2 py-1 bg-secondary rounded-lg text-foreground">{item}</span>
                ))}
                <button className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg font-display">+ Adicionar</button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4 mt-4">
          <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Lembretes de Próxima Ação</p>
              <p className="text-xs text-muted-foreground">Notificar quando ações estiverem vencidas</p>
            </div>
            <Switch checked={notificacoesAtivas} onCheckedChange={setNotificacoesAtivas} />
          </div>
        </TabsContent>

        <TabsContent value="exportar" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => exportCSV(clients as unknown as Record<string, unknown>[], "clientes")}>
              <Download className="h-5 w-5 text-primary" />
              <span className="text-xs font-display">Exportar Clientes CSV</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => exportCSV(interactions as unknown as Record<string, unknown>[], "historico")}>
              <Download className="h-5 w-5 text-primary" />
              <span className="text-xs font-display">Exportar Histórico CSV</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => exportCSV(sales as unknown as Record<string, unknown>[], "vendas")}>
              <Download className="h-5 w-5 text-primary" />
              <span className="text-xs font-display">Exportar Vendas CSV</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={exportJSON}>
              <Database className="h-5 w-5 text-primary" />
              <span className="text-xs font-display">Backup JSON Completo</span>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

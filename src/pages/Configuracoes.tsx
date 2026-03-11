import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clients } from "@/data/clients";
import { interactions } from "@/data/interactions";
import { sales } from "@/data/sales";
import { projects } from "@/data/projects";
import { User, Building2, Tags, Bell, Download, Database } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
    <motion.div
      className="p-6 space-y-4 max-w-3xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-bold text-foreground tracking-tight"
      >
        Configurações
      </motion.h1>

      <Tabs defaultValue="perfil">
        <TabsList className="glass-subtle rounded-xl">
          <TabsTrigger value="perfil" className="text-xs rounded-lg"><User className="h-3 w-3 mr-1" /> Perfil</TabsTrigger>
          <TabsTrigger value="empresa" className="text-xs rounded-lg"><Building2 className="h-3 w-3 mr-1" /> Empresa</TabsTrigger>
          <TabsTrigger value="categorias" className="text-xs rounded-lg"><Tags className="h-3 w-3 mr-1" /> Categorias</TabsTrigger>
          <TabsTrigger value="notificacoes" className="text-xs rounded-lg"><Bell className="h-3 w-3 mr-1" /> Notificações</TabsTrigger>
          <TabsTrigger value="exportar" className="text-xs rounded-lg"><Download className="h-3 w-3 mr-1" /> Exportar</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full glass text-primary font-display text-xl flex items-center justify-center font-bold">JP</div>
            <div>
              <p className="font-display font-bold text-foreground">Junior Pinheiro</p>
              <p className="text-sm text-muted-foreground">Executivo Comercial</p>
            </div>
          </motion.div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Nome</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" defaultValue="Junior Pinheiro" /></div>
            <div><Label className="text-xs">Cargo</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" defaultValue="Executivo Comercial" /></div>
            <div><Label className="text-xs">E-mail</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" defaultValue="junior@morelate.com.br" /></div>
            <div><Label className="text-xs">Telefone</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
          </div>
          <Button className="font-display rounded-xl">Salvar Perfil</Button>
        </TabsContent>

        <TabsContent value="empresa" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Nome da Empresa</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" defaultValue="Morelate" /></div>
            <div><Label className="text-xs">CNPJ</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
            <div className="col-span-2"><Label className="text-xs">Endereço</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
          </div>
          <div className="border border-dashed border-border/30 rounded-2xl p-6 text-center text-muted-foreground glass-subtle hover:border-primary/20 transition-colors">
            <p className="text-xs">Arraste o logo da empresa aqui</p>
          </div>
          <Button className="font-display rounded-xl">Salvar Empresa</Button>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4 mt-4">
          {[
            { label: "Tipos de Empresa", items: ["Federação", "Associação", "Locadora", "Seguradora", "Transportadora", "Tecnologia", "Distribuidora", "Revendedor", "Oficina", "Frota Própria"] },
            { label: "Status de Cliente", items: ["Ativo", "Lead", "Prospect", "Inativo", "Sem compras"] },
            { label: "Linhas de Peças", items: ["Motor", "Suspensão", "Freios", "Elétrica", "Lataria", "Filtros", "Transmissão", "Eixos", "Escapamento"] },
            { label: "Marcas", items: ["Mercedes-Benz", "Volks", "Scania", "Iveco", "Volvo", "DAF", "MAN", "Ford"] },
          ].map((cat, idx) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="glass rounded-2xl p-4"
            >
              <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground mb-3">{cat.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map(item => (
                  <span key={item} className="text-xs px-2.5 py-1 glass-subtle rounded-full text-foreground">{item}</span>
                ))}
                <button className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-display hover:bg-primary/20 transition-colors">+ Adicionar</button>
              </div>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-foreground text-sm">Lembretes de Próxima Ação</p>
              <p className="text-xs text-muted-foreground">Notificar quando ações estiverem vencidas</p>
            </div>
            <Switch checked={notificacoesAtivas} onCheckedChange={setNotificacoesAtivas} />
          </motion.div>
        </TabsContent>

        <TabsContent value="exportar" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Download, label: "Exportar Clientes CSV", onClick: () => exportCSV(clients as unknown as Record<string, unknown>[], "clientes") },
              { icon: Download, label: "Exportar Histórico CSV", onClick: () => exportCSV(interactions as unknown as Record<string, unknown>[], "historico") },
              { icon: Download, label: "Exportar Vendas CSV", onClick: () => exportCSV(sales as unknown as Record<string, unknown>[], "vendas") },
              { icon: Database, label: "Backup JSON Completo", onClick: exportJSON },
            ].map((btn, idx) => (
              <motion.div
                key={btn.label}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 glass rounded-2xl border-0 hover:bg-foreground/5" onClick={btn.onClick}>
                  <btn.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-display">{btn.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

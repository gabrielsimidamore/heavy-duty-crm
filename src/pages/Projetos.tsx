import { useState } from "react";
import { projects, type Project, type ProjectStatus, type ProjectPriority } from "@/data/projects";
import { clients } from "@/data/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, LayoutGrid, List, Calendar, Lightbulb, Search as SearchIcon, Paperclip } from "lucide-react";

const statusColumns: { status: ProjectStatus; emoji: string; color: string }[] = [
  { status: "Ideia", emoji: "💡", color: "border-muted-foreground" },
  { status: "Em Análise", emoji: "🔍", color: "border-status-lead" },
  { status: "Em Andamento", emoji: "🚀", color: "border-primary" },
  { status: "Pausado", emoji: "⏸️", color: "border-status-prospect" },
  { status: "Concluído", emoji: "✅", color: "border-success" },
  { status: "Cancelado", emoji: "❌", color: "border-destructive" },
];

const priorityBadge: Record<ProjectPriority, string> = {
  "Alta": "bg-destructive/15 text-destructive",
  "Média": "bg-primary/15 text-primary",
  "Baixa": "bg-success/15 text-green-400",
};

export default function Projetos() {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [showNewProject, setShowNewProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [search, setSearch] = useState("");

  const filtered = projects.filter(p =>
    !search || p.nome.toLowerCase().includes(search.toLowerCase()) || (p.clientName && p.clientName.toLowerCase().includes(search.toLowerCase()))
  );

  const today = "2026-03-10";

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Projetos & Ideias</h1>
        <div className="flex gap-2">
          <Button variant={viewMode === "kanban" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setViewMode("kanban")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
          <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs font-display"><Plus className="h-3 w-3 mr-1" /> Novo Projeto</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto bg-popover border-border">
              <DialogHeader><DialogTitle className="font-display text-lg">Novo Projeto</DialogTitle></DialogHeader>
              <NewProjectForm onClose={() => setShowNewProject(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Buscar projetos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-card border-border text-sm h-9" />
      </div>

      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-auto">
          {statusColumns.map(col => (
            <div key={col.status} className="min-w-[200px]">
              <div className={`flex items-center gap-2 pb-2 mb-3 border-b-2 ${col.color}`}>
                <span>{col.emoji}</span>
                <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">{col.status}</span>
                <span className="text-xs text-muted-foreground">({filtered.filter(p => p.status === col.status).length})</span>
              </div>
              <div className="space-y-3">
                {filtered.filter(p => p.status === col.status).map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/30 transition-colors"
                  >
                    <p className="font-medium text-foreground text-sm mb-2">{p.nome}</p>
                    {p.clientName && (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-display uppercase tracking-wider bg-primary/10 text-primary rounded mb-2">
                        {p.clientName}
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-display uppercase tracking-wider ${priorityBadge[p.prioridade]}`}>
                        {p.prioridade}
                      </span>
                    </div>
                    <Progress value={p.progresso} className="h-1.5 mb-1" />
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{p.progresso}%</span>
                      {p.prazo && (
                        <span className={`flex items-center gap-1 ${p.prazo <= today ? "text-destructive" : ""}`}>
                          <Calendar className="h-2.5 w-2.5" /> {formatDate(p.prazo)}
                        </span>
                      )}
                    </div>
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.tags.slice(0, 2).map(t => (
                          <span key={t} className="text-[9px] px-1 py-0.5 bg-secondary rounded text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                {["Projeto", "Cliente", "Tipo", "Prioridade", "Status", "Progresso", "Prazo"].map(h => (
                  <th key={h} className="text-left px-3 py-2 font-display text-xs uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} onClick={() => setSelectedProject(p)} className="border-b border-border hover:bg-secondary/30 cursor-pointer transition-colors">
                  <td className="px-3 py-2.5 font-medium text-foreground">{p.nome}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{p.clientName || "—"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{p.tipo}</td>
                  <td className="px-3 py-2.5"><span className={`text-xs px-1.5 py-0.5 rounded font-display ${priorityBadge[p.prioridade]}`}>{p.prioridade}</span></td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{p.status}</td>
                  <td className="px-3 py-2.5"><div className="flex items-center gap-2"><Progress value={p.progresso} className="h-1.5 w-16" /><span className="text-xs text-muted-foreground">{p.progresso}%</span></div></td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{p.prazo ? formatDate(p.prazo) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Project Detail Sheet */}
      <Sheet open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <SheetContent className="bg-popover border-l border-border w-[480px] sm:w-[540px] overflow-auto">
          {selectedProject && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-lg text-foreground">{selectedProject.nome}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded font-display uppercase tracking-wider ${priorityBadge[selectedProject.prioridade]}`}>
                    {selectedProject.prioridade}
                  </span>
                  {selectedProject.clientName && (
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-display">{selectedProject.clientName}</span>
                  )}
                  <span className="text-xs text-muted-foreground">{selectedProject.tipo}</span>
                </div>

                <p className="text-sm text-muted-foreground">{selectedProject.descricao}</p>

                <div className="bg-secondary/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Progresso</span>
                    <span className="font-display text-sm font-bold text-primary">{selectedProject.progresso}%</span>
                  </div>
                  <Progress value={selectedProject.progresso} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Início</span><p className="text-foreground">{selectedProject.dataInicio ? formatDate(selectedProject.dataInicio) : "—"}</p></div>
                  <div><span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Prazo</span><p className="text-foreground">{selectedProject.prazo ? formatDate(selectedProject.prazo) : "—"}</p></div>
                  <div><span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Responsável</span><p className="text-foreground">{selectedProject.responsavel}</p></div>
                  <div><span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">Status</span><p className="text-foreground">{selectedProject.status}</p></div>
                </div>

                {/* Checklist */}
                <div>
                  <p className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-2">Tarefas</p>
                  <div className="space-y-2">
                    {selectedProject.tasks.map(t => (
                      <div key={t.id} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={t.done} disabled className="border-border" />
                        <span className={`${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</span>
                        {t.dueDate && <span className={`text-[10px] ml-auto ${t.dueDate <= today ? "text-destructive" : "text-muted-foreground"}`}>{formatDate(t.dueDate)}</span>}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedProject.tasks.filter(t => t.done).length}/{selectedProject.tasks.length} concluídas
                  </p>
                </div>

                {/* Notes */}
                <div className="bg-secondary/30 rounded-lg p-3">
                  <p className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm text-foreground">{selectedProject.notas}</p>
                </div>

                {/* Tags */}
                {selectedProject.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedProject.tags.map(t => (
                      <span key={t} className="text-xs px-2 py-0.5 bg-secondary rounded text-muted-foreground">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function NewProjectForm({ onClose }: { onClose: () => void }) {
  const [progresso, setProgresso] = useState([0]);
  const uniqueClients = Array.from(new Map(clients.map(c => [c.id, c])).values());

  return (
    <div className="space-y-4">
      <div><Label className="text-xs">Nome do Projeto *</Label><Input className="bg-card border-border mt-1" /></div>
      <div><Label className="text-xs">Descrição</Label><Textarea className="bg-card border-border mt-1" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Cliente Vinculado</Label>
          <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Opcional" /></SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {uniqueClients.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.contato} — {c.empresa}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Tipo</Label>
          <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {["Parceria Comercial", "Piloto", "Proposta", "Evento", "Integração de Sistema", "Prospecção", "Interno", "Outro"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Prioridade *</Label>
          <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {["Alta", "Média", "Baixa"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Status *</Label>
          <Select><SelectTrigger className="bg-card border-border mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {["Ideia", "Em Análise", "Em Andamento", "Pausado", "Concluído", "Cancelado"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs">Data de Início</Label><Input type="date" className="bg-card border-border mt-1" /></div>
        <div><Label className="text-xs">Prazo / Data Limite</Label><Input type="date" className="bg-card border-border mt-1" /></div>
      </div>
      <div>
        <Label className="text-xs">Progresso: {progresso[0]}%</Label>
        <Slider value={progresso} onValueChange={setProgresso} max={100} step={5} className="mt-2" />
      </div>
      <div><Label className="text-xs">Responsável</Label><Input className="bg-card border-border mt-1" defaultValue="Junior Pinheiro" /></div>
      <div><Label className="text-xs">Tags</Label><Input className="bg-card border-border mt-1" placeholder="Separe por vírgula" /></div>
      <div><Label className="text-xs">Notas / Ideias</Label><Textarea className="bg-card border-border mt-1 min-h-[80px]" /></div>
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground">
        <Paperclip className="h-5 w-5 mx-auto mb-1 opacity-50" />
        <p className="text-xs">Arraste arquivos ou cole imagens (Ctrl+V)</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1 font-display" onClick={onClose}>Salvar Projeto</Button>
      </div>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

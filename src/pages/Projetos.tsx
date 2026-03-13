import { useState, useCallback } from "react";
import { type Project, type ProjectStatus, type ProjectPriority, type ProjectTask } from "@/data/projects";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Plus, LayoutGrid, List, Calendar, Search as SearchIcon, Paperclip, Pencil, Save, X, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";

const statusColumns: { status: ProjectStatus; emoji: string; color: string }[] = [
  { status: "Ideia", emoji: "💡", color: "border-muted-foreground" },
  { status: "Em Análise", emoji: "🔍", color: "border-status-lead" },
  { status: "Em Andamento", emoji: "🚀", color: "border-primary" },
  { status: "Pausado", emoji: "⏸️", color: "border-status-prospect" },
  { status: "Concluído", emoji: "✅", color: "border-success" },
  { status: "Cancelado", emoji: "❌", color: "border-destructive" },
];

const priorityBadge: Record<ProjectPriority, string> = {
  "Alta": "bg-destructive/10 text-destructive",
  "Média": "bg-primary/10 text-primary",
  "Baixa": "bg-success/10 text-green-400",
};

export default function Projetos() {
  const { projects: initialProjects, loading } = useProjects();
  const { clients } = useClients();
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [initialized, setInitialized] = useState(false);
  if (!initialized && initialProjects.length > 0) { setProjectsList(initialProjects); setInitialized(true); }
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [showNewProject, setShowNewProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [search, setSearch] = useState("");

  const filtered = projectsList.filter(p =>
    !search || p.nome.toLowerCase().includes(search.toLowerCase()) || (p.clientName && p.clientName.toLowerCase().includes(search.toLowerCase()))
  );

  const today = "2026-03-12";

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const projectId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId as ProjectStatus;
    setProjectsList(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
    toast.success(`Projeto movido para "${newStatus}"`);
  }, []);

  const handleSaveProject = (updated: Project) => {
    setProjectsList(prev => prev.map(p => p.id === updated.id ? updated : p));
    setSelectedProject(updated);
    setEditingProject(null);
    toast.success("Projeto atualizado!");
  };

  const handleToggleTask = (projectId: number, taskId: number) => {
    setProjectsList(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) };
    }));
    const updated = projectsList.find(p => p.id === projectId);
    if (updated && selectedProject?.id === projectId) {
      setSelectedProject({ ...updated, tasks: updated.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) });
    }
  };

  const handleUpdateTaskAssignee = (projectId: number, taskId: number, responsavel: string) => {
    setProjectsList(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, responsavel } : t) };
    }));
  };

  return (
    <motion.div className="p-6 space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Projetos & Ideias</h1>
        <div className="flex gap-2">
          <Button variant={viewMode === "kanban" ? "default" : "outline"} size="icon" className="h-8 w-8 rounded-xl" onClick={() => setViewMode("kanban")}><LayoutGrid className="h-4 w-4" /></Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" className="h-8 w-8 rounded-xl" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
          <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs font-display rounded-xl"><Plus className="h-3 w-3 mr-1" /> Novo Projeto</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto glass-elevated rounded-2xl border-0">
              <DialogHeader><DialogTitle className="font-display text-lg">Novo Projeto</DialogTitle></DialogHeader>
              <NewProjectForm onClose={() => setShowNewProject(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Buscar projetos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-transparent border-border/50 text-sm h-9 rounded-xl" />
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === "kanban" ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <motion.div key="kanban" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-auto">
              {statusColumns.map((col, colIdx) => (
                <Droppable droppableId={col.status} key={col.status}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: colIdx * 0.06 }}
                      className={`min-w-[200px] min-h-[120px] rounded-2xl p-2 transition-colors ${snapshot.isDraggingOver ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}
                    >
                      <div className={`flex items-center gap-2 pb-2 mb-3 border-b-2 ${col.color}`}>
                        <span>{col.emoji}</span>
                        <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">{col.status}</span>
                        <span className="text-xs text-muted-foreground">({filtered.filter(p => p.status === col.status).length})</span>
                      </div>
                      <div className="space-y-3">
                        {filtered.filter(p => p.status === col.status).map((p, idx) => (
                          <Draggable key={p.id} draggableId={p.id.toString()} index={idx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedProject(p)}
                                className={`glass glass-shimmer rounded-2xl p-3.5 cursor-grab active:cursor-grabbing transition-all ${snapshot.isDragging ? "ring-2 ring-primary/40 shadow-xl shadow-primary/10 scale-105" : ""}`}
                              >
                                <p className="font-medium text-foreground text-sm mb-2">{p.nome}</p>
                                {p.clientName && (
                                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-display uppercase tracking-wider bg-primary/10 text-primary rounded-full mb-2">{p.clientName}</span>
                                )}
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-display uppercase tracking-wider ${priorityBadge[p.prioridade]}`}>{p.prioridade}</span>
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
                                      <span key={t} className="text-[9px] px-1.5 py-0.5 glass-subtle rounded-full text-muted-foreground">{t}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </motion.div>
                  )}
                </Droppable>
              ))}
            </motion.div>
          </DragDropContext>
        ) : (
          <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="glass rounded-2xl overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  {["Projeto", "Cliente", "Tipo", "Prioridade", "Status", "Progresso", "Prazo"].map(h => (
                    <th key={h} className="text-left px-3 py-3 font-display text-[10px] uppercase tracking-widest text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <motion.tr key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: idx * 0.03 }}
                    onClick={() => setSelectedProject(p)} className="border-b border-border/20 hover:bg-foreground/[0.03] cursor-pointer transition-colors">
                    <td className="px-3 py-3 font-medium text-foreground">{p.nome}</td>
                    <td className="px-3 py-3 text-muted-foreground text-xs">{p.clientName || "—"}</td>
                    <td className="px-3 py-3 text-muted-foreground text-xs">{p.tipo}</td>
                    <td className="px-3 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-display ${priorityBadge[p.prioridade]}`}>{p.prioridade}</span></td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{p.status}</td>
                    <td className="px-3 py-3"><div className="flex items-center gap-2"><Progress value={p.progresso} className="h-1.5 w-16" /><span className="text-xs text-muted-foreground">{p.progresso}%</span></div></td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{p.prazo ? formatDate(p.prazo) : "—"}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Detail Sheet */}
      <Sheet open={!!selectedProject} onOpenChange={() => { setSelectedProject(null); setEditingProject(null); }}>
        <SheetContent className="glass-elevated border-l-0 w-[480px] sm:w-[540px] overflow-auto rounded-l-3xl">
          {selectedProject && !editingProject && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="font-display text-lg text-foreground">{selectedProject.nome}</SheetTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setEditingProject({ ...selectedProject })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-display uppercase tracking-wider ${priorityBadge[selectedProject.prioridade]}`}>{selectedProject.prioridade}</span>
                  {selectedProject.clientName && <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-display">{selectedProject.clientName}</span>}
                  <span className="text-xs text-muted-foreground">{selectedProject.tipo}</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedProject.descricao}</p>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-subtle rounded-2xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">Progresso</span>
                    <span className="font-display text-sm font-bold text-primary">{selectedProject.progresso}%</span>
                  </div>
                  <Progress value={selectedProject.progresso} className="h-2" />
                </motion.div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">Início</span><p className="text-foreground">{selectedProject.dataInicio ? formatDate(selectedProject.dataInicio) : "—"}</p></div>
                  <div><span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">Prazo</span><p className="text-foreground">{selectedProject.prazo ? formatDate(selectedProject.prazo) : "—"}</p></div>
                  <div><span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">Responsável</span><p className="text-foreground">{selectedProject.responsavel}</p></div>
                  <div><span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">Status</span><p className="text-foreground">{selectedProject.status}</p></div>
                </div>

                {/* Checklist with assignees */}
                <div>
                  <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-2">Tarefas</p>
                  <div className="space-y-2">
                    {projectsList.find(p => p.id === selectedProject.id)?.tasks.map(t => (
                      <div key={t.id} className="flex items-center gap-2 text-sm glass-subtle rounded-xl p-2.5">
                        <Checkbox checked={t.done} onCheckedChange={() => handleToggleTask(selectedProject.id, t.id)} className="border-border/30" />
                        <div className="flex-1 min-w-0">
                          <span className={`block ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</span>
                          {t.responsavel && (
                            <span className="text-[10px] text-primary flex items-center gap-1 mt-0.5"><UserPlus className="h-2.5 w-2.5" /> {t.responsavel}</span>
                          )}
                        </div>
                        {t.dueDate && <span className={`text-[10px] shrink-0 ${t.dueDate <= today ? "text-destructive" : "text-muted-foreground"}`}>{formatDate(t.dueDate)}</span>}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {projectsList.find(p => p.id === selectedProject.id)?.tasks.filter(t => t.done).length}/{selectedProject.tasks.length} concluídas
                  </p>
                </div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-subtle rounded-2xl p-3.5">
                  <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm text-foreground">{selectedProject.notas}</p>
                </motion.div>

                {selectedProject.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.tags.map(t => <span key={t} className="text-xs px-2.5 py-1 glass-subtle rounded-full text-muted-foreground">{t}</span>)}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Edit Mode */}
          {editingProject && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="font-display text-lg text-foreground">Editar Projeto</SheetTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setEditingProject(null)}><X className="h-4 w-4" /></Button>
                    <Button size="icon" className="h-8 w-8 rounded-xl" onClick={() => handleSaveProject(editingProject)}><Save className="h-4 w-4" /></Button>
                  </div>
                </div>
              </SheetHeader>
              <div className="mt-4 space-y-3">
                <div><Label className="text-xs">Nome</Label><Input value={editingProject.nome} onChange={e => setEditingProject({ ...editingProject, nome: e.target.value })} className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
                <div><Label className="text-xs">Descrição</Label><Textarea value={editingProject.descricao} onChange={e => setEditingProject({ ...editingProject, descricao: e.target.value })} className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Prioridade</Label>
                    <Select value={editingProject.prioridade} onValueChange={v => setEditingProject({ ...editingProject, prioridade: v as ProjectPriority })}>
                      <SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass-elevated border-0 rounded-2xl">
                        {(["Alta", "Média", "Baixa"] as ProjectPriority[]).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <Select value={editingProject.status} onValueChange={v => setEditingProject({ ...editingProject, status: v as ProjectStatus })}>
                      <SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass-elevated border-0 rounded-2xl">
                        {statusColumns.map(s => <SelectItem key={s.status} value={s.status}>{s.emoji} {s.status}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Data Início</Label><Input type="date" value={editingProject.dataInicio || ""} onChange={e => setEditingProject({ ...editingProject, dataInicio: e.target.value })} className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
                  <div><Label className="text-xs">Prazo</Label><Input type="date" value={editingProject.prazo || ""} onChange={e => setEditingProject({ ...editingProject, prazo: e.target.value })} className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
                </div>
                <div>
                  <Label className="text-xs">Progresso: {editingProject.progresso}%</Label>
                  <Slider value={[editingProject.progresso]} onValueChange={v => setEditingProject({ ...editingProject, progresso: v[0] })} max={100} step={5} className="mt-2" />
                </div>
                <div><Label className="text-xs">Responsável</Label><Input value={editingProject.responsavel} onChange={e => setEditingProject({ ...editingProject, responsavel: e.target.value })} className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
                <div><Label className="text-xs">Tipo</Label><Input value={editingProject.tipo} onChange={e => setEditingProject({ ...editingProject, tipo: e.target.value })} className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
                <div><Label className="text-xs">Notas</Label><Textarea value={editingProject.notas} onChange={e => setEditingProject({ ...editingProject, notas: e.target.value })} className="bg-transparent border-border/40 mt-1 min-h-[80px] rounded-xl" /></div>
                <div><Label className="text-xs">Tags (separar por vírgula)</Label><Input value={editingProject.tags.join(", ")} onChange={e => setEditingProject({ ...editingProject, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })} className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>

                {/* Edit Tasks with Assignees */}
                <div>
                  <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-2">Tarefas & Responsáveis</p>
                  <div className="space-y-2">
                    {editingProject.tasks.map((t, idx) => (
                      <div key={t.id} className="glass-subtle rounded-xl p-2.5 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={t.done} onCheckedChange={() => {
                            const tasks = [...editingProject.tasks];
                            tasks[idx] = { ...tasks[idx], done: !tasks[idx].done };
                            setEditingProject({ ...editingProject, tasks });
                          }} className="border-border/30" />
                          <Input value={t.title} onChange={e => {
                            const tasks = [...editingProject.tasks];
                            tasks[idx] = { ...tasks[idx], title: e.target.value };
                            setEditingProject({ ...editingProject, tasks });
                          }} className="bg-transparent border-border/30 text-sm h-8 rounded-lg flex-1" />
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg shrink-0 text-destructive" onClick={() => {
                            setEditingProject({ ...editingProject, tasks: editingProject.tasks.filter((_, i) => i !== idx) });
                          }}><X className="h-3 w-3" /></Button>
                        </div>
                        <div className="flex items-center gap-2 pl-7">
                          <UserPlus className="h-3 w-3 text-muted-foreground shrink-0" />
                          <Input value={t.responsavel || ""} onChange={e => {
                            const tasks = [...editingProject.tasks];
                            tasks[idx] = { ...tasks[idx], responsavel: e.target.value };
                            setEditingProject({ ...editingProject, tasks });
                          }} placeholder="Responsável pela tarefa" className="bg-transparent border-border/30 text-xs h-7 rounded-lg" />
                          <Input type="date" value={t.dueDate || ""} onChange={e => {
                            const tasks = [...editingProject.tasks];
                            tasks[idx] = { ...tasks[idx], dueDate: e.target.value };
                            setEditingProject({ ...editingProject, tasks });
                          }} className="bg-transparent border-border/30 text-xs h-7 rounded-lg w-[140px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2 rounded-xl border-border/30 text-xs" onClick={() => {
                    const newId = Math.max(0, ...editingProject.tasks.map(t => t.id)) + 1;
                    setEditingProject({ ...editingProject, tasks: [...editingProject.tasks, { id: newId, title: "", done: false }] });
                  }}><Plus className="h-3 w-3 mr-1" /> Adicionar Tarefa</Button>
                </div>

                <Button className="w-full font-display rounded-xl" onClick={() => handleSaveProject(editingProject)}><Save className="h-4 w-4 mr-1" /> Salvar Alterações</Button>
              </div>
            </motion.div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}

function NewProjectForm({ onClose }: { onClose: () => void }) {
  const [progresso, setProgresso] = useState([0]);
  const { clients } = useClients();
  const uniqueClients = Array.from(new Map(clients.map(c => [c.id, c])).values());

  return (
    <div className="space-y-4">
      <div><Label className="text-xs">Nome do Projeto *</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
      <div><Label className="text-xs">Descrição</Label><Textarea className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Cliente Vinculado", options: uniqueClients.map(c => ({ key: c.id.toString(), label: `${c.contato} — ${c.empresa}` })), placeholder: "Opcional" },
          { label: "Tipo", options: ["Parceria Comercial", "Piloto", "Proposta", "Evento", "Integração de Sistema", "Prospecção", "Interno", "Outro"].map(t => ({ key: t, label: t })), placeholder: "Selecione" },
          { label: "Prioridade *", options: ["Alta", "Média", "Baixa"].map(p => ({ key: p, label: p })), placeholder: "Selecione" },
          { label: "Status *", options: ["Ideia", "Em Análise", "Em Andamento", "Pausado", "Concluído", "Cancelado"].map(s => ({ key: s, label: s })), placeholder: "Selecione" },
        ].map(sel => (
          <div key={sel.label}>
            <Label className="text-xs">{sel.label}</Label>
            <Select><SelectTrigger className="bg-transparent border-border/40 mt-1 rounded-xl"><SelectValue placeholder={sel.placeholder} /></SelectTrigger>
              <SelectContent className="glass-elevated border-0 rounded-2xl">
                {sel.options.map(o => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ))}
        <div><Label className="text-xs">Data de Início</Label><Input type="date" className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
        <div><Label className="text-xs">Prazo / Data Limite</Label><Input type="date" className="bg-transparent border-border/40 mt-1 rounded-xl" /></div>
      </div>
      <div>
        <Label className="text-xs">Progresso: {progresso[0]}%</Label>
        <Slider value={progresso} onValueChange={setProgresso} max={100} step={5} className="mt-2" />
      </div>
      <div><Label className="text-xs">Responsável</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" defaultValue="Junior Pinheiro" /></div>
      <div><Label className="text-xs">Tags</Label><Input className="bg-transparent border-border/40 mt-1 rounded-xl" placeholder="Separe por vírgula" /></div>
      <div><Label className="text-xs">Notas / Ideias</Label><Textarea className="bg-transparent border-border/40 mt-1 min-h-[80px] rounded-xl" /></div>
      <div className="border border-dashed border-border/30 rounded-2xl p-6 text-center text-muted-foreground glass-subtle hover:border-primary/20 transition-colors">
        <Paperclip className="h-5 w-5 mx-auto mb-1 opacity-50" />
        <p className="text-xs">Arraste arquivos ou cole imagens (Ctrl+V)</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 rounded-xl border-border/30" onClick={onClose}>Cancelar</Button>
        <Button className="flex-1 font-display rounded-xl" onClick={onClose}>Salvar Projeto</Button>
      </div>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

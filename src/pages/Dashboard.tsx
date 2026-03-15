import { Users, UserCheck, UserPlus, Eye, AlertTriangle, Lightbulb, Plus, Mail, Phone, Handshake, Clock, ArrowUpRight, Download } from "lucide-react";
import { motion } from "framer-motion";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useClients } from "@/hooks/useClients";
import { useInteractions } from "@/hooks/useInteractions";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const today = new Date().toISOString().slice(0, 10);

const STATUS_COLORS: Record<string, string> = {
  "Ativo": "#00875A", "Lead": "#0052CC", "Prospect": "#FF8B00",
  "Inativo": "#6B778C", "Sem compras": "#DE350B",
};

const typeIcons: Record<string, typeof Mail> = {
  "E-mail": Mail, "WhatsApp": Phone, "Reunião": Handshake,
};

const tip = {
  contentStyle: { background: "#fff", border: "1px solid #E2E4E9", borderRadius: "6px", fontSize: "12px", boxShadow: "0 4px 16px -4px rgba(0,0,0,0.12)", color: "#172B4D" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { clients } = useClients();
  const { interactions } = useInteractions();
  const { projects } = useProjects();

  const ativos    = clients.filter(c => c.status === "Ativo");
  const leads     = clients.filter(c => c.status === "Lead");
  const prospects = clients.filter(c => c.status === "Prospect");
  const semCompras= clients.filter(c => c.status === "Sem compras");
  const projAtivos= projects.filter(p => p.status === "Em Andamento").length;

  const pieData = [
    { name: "Ativo", value: ativos.length },
    { name: "Lead", value: leads.length },
    { name: "Prospect", value: prospects.length },
    { name: "Inativo", value: clients.filter(c => c.status === "Inativo").length },
    { name: "Sem compras", value: semCompras.length },
  ].filter(d => d.value > 0);

  const monthCount: Record<string, number> = {};
  interactions.forEach(i => { const m = i.date.slice(0, 7); monthCount[m] = (monthCount[m] || 0) + 1; });
  const barData = Object.entries(monthCount).sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month: month.replace(/^(\d{4})-(\d{2})$/, "$2/$1"), value }));

  const tipoCount: Record<string, number> = {};
  clients.forEach(c => { tipoCount[c.tipoEmpresa] = (tipoCount[c.tipoEmpresa] || 0) + 1; });
  const segData = Object.entries(tipoCount).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

  const recent = [...interactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const upcoming = interactions.filter(i => i.proximaAcao)
    .sort((a, b) => (a.dataPrevista || "9999").localeCompare(b.dataPrevista || "9999")).slice(0, 5);

  return (
    <div className="p-6 space-y-5 max-w-[1600px]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-foreground">Dashboard</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5 capitalize">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 text-[13px] gap-1.5 border-border">
            <Download className="h-3.5 w-3.5" /> Exportar
          </Button>
          {[["Novo Cliente", "/clientes"], ["Nova Interação", "/historico"]].map(([label, path]) => (
            <Button key={label} size="sm" onClick={() => navigate(path)} className="h-8 text-[13px] gap-1.5 bg-primary hover:bg-primary/90">
              <Plus className="h-3.5 w-3.5" /> {label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Total" value={clients.length} icon={Users} index={0} />
        <KpiCard title="Ativos" value={ativos.length} icon={UserCheck} index={1} color="green" />
        <KpiCard title="Leads" value={leads.length} icon={UserPlus} index={2} color="blue" />
        <KpiCard title="Prospects" value={prospects.length} icon={Eye} index={3} color="amber" />
        <KpiCard title="Sem Compras" value={semCompras.length} icon={AlertTriangle} index={4} color="red" />
        <KpiCard title="Projetos" value={projAtivos} icon={Lightbulb} index={5} color="purple" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="lg:col-span-2 surface-card rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[14px] font-semibold text-foreground">Interações por Mês</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">Histórico de contatos realizados</p>
            </div>
            <button onClick={() => navigate("/historico")} className="text-[12px] text-primary hover:underline flex items-center gap-1">
              Ver detalhes <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#6B778C", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B778C", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip {...tip} />
              <Bar dataKey="value" name="Interações" fill="#0176D3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="surface-card rounded-lg p-5">
          <div className="mb-4">
            <h3 className="text-[14px] font-semibold text-foreground">Clientes por Status</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">{clients.length} clientes total</p>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={34} outerRadius={56} strokeWidth={2} stroke="#fff" paddingAngle={2}>
                {pieData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#6B778C"} />)}
              </Pie>
              <Tooltip {...tip} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm" style={{ background: STATUS_COLORS[d.name] }} />
                  <span className="text-[12px] text-muted-foreground">{d.name}</span>
                </div>
                <span className="text-[12px] font-semibold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Segmento */}
        <div className="surface-card rounded-lg p-5">
          <h3 className="text-[14px] font-semibold text-foreground mb-4">Por Segmento</h3>
          <div className="space-y-3">
            {segData.map(d => (
              <div key={d.name}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] text-muted-foreground">{d.name}</span>
                  <span className="text-[12px] font-semibold text-foreground">{d.value}</span>
                </div>
                <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(d.value / clients.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Atividade recente */}
        <div className="surface-card rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-foreground">Atividade Recente</h3>
            <button onClick={() => navigate("/historico")} className="text-[12px] text-primary hover:underline flex items-center gap-1">ver tudo <ArrowUpRight className="h-3 w-3" /></button>
          </div>
          <div className="space-y-1">
            {recent.map((i, idx) => {
              const Icon = typeIcons[i.type] || Mail;
              return (
                <div key={i.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-accent transition-colors cursor-default group">
                  <div className="w-7 h-7 rounded-md bg-accent border border-border flex items-center justify-center shrink-0 mt-0.5 group-hover:border-primary/20">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-semibold text-foreground truncate">{i.empresa}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0">{formatDate(i.date)}</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground truncate">{i.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Próximas ações */}
        <div className="surface-card rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-foreground">Próximas Ações</h3>
            <button onClick={() => navigate("/historico")} className="text-[12px] text-primary hover:underline flex items-center gap-1">ver tudo <ArrowUpRight className="h-3 w-3" /></button>
          </div>
          <div className="space-y-1">
            {upcoming.map((i) => {
              const over = i.dataPrevista && i.dataPrevista <= today;
              return (
                <div key={i.id} className={`flex items-start gap-3 p-2 rounded-md transition-colors cursor-default ${over ? "bg-red-50 border-l-2 border-red-400 action-pulse" : "hover:bg-accent"}`}>
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${over ? "bg-red-100" : "bg-accent border border-border"}`}>
                    <Clock className={`h-3.5 w-3.5 ${over ? "text-red-500" : "text-muted-foreground"}`} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-semibold text-foreground truncate">{i.empresa}</span>
                      {i.dataPrevista && (
                        <span className={`text-[11px] shrink-0 ${over ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                          {formatDate(i.dataPrevista)}{over ? " !" : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground truncate">{i.proximaAcao}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}`;
}

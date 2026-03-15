import { Users, UserCheck, UserPlus, Eye, AlertTriangle, Lightbulb, Plus, Mail, Phone, Handshake, Clock, ArrowRight, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useClients } from "@/hooks/useClients";
import { useInteractions } from "@/hooks/useInteractions";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Area, AreaChart,
} from "recharts";

const today = new Date().toISOString().slice(0, 10);

const STATUS_COLORS: Record<string, string> = {
  "Ativo": "#34d399", "Lead": "#60a5fa", "Prospect": "#fbbf24",
  "Inativo": "#64748b", "Sem compras": "#f87171",
};

const typeIcons: Record<string, typeof Mail> = {
  "E-mail": Mail, "WhatsApp": Phone, "Reunião": Handshake,
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const tooltipStyle = {
  backgroundColor: "hsl(222 47% 8%)",
  border: "1px solid hsl(222 47% 14%)",
  borderRadius: "10px",
  fontFamily: "Inter",
  fontSize: "12px",
  boxShadow: "0 8px 32px -8px rgba(0,0,0,0.6)",
  color: "hsl(210 40% 98%)",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { clients } = useClients();
  const { interactions } = useInteractions();
  const { projects } = useProjects();

  const ativos = clients.filter(c => c.status === "Ativo");
  const leads = clients.filter(c => c.status === "Lead");
  const prospects = clients.filter(c => c.status === "Prospect");
  const semCompras = clients.filter(c => c.status === "Sem compras");
  const projetosAtivos = projects.filter(p => p.status === "Em Andamento").length;

  const pieData = [
    { name: "Ativo", value: ativos.length },
    { name: "Lead", value: leads.length },
    { name: "Prospect", value: prospects.length },
    { name: "Inativo", value: clients.filter(c => c.status === "Inativo").length },
    { name: "Sem compras", value: semCompras.length },
  ].filter(d => d.value > 0);

  const tipoCount: Record<string, number> = {};
  clients.forEach(c => { tipoCount[c.tipoEmpresa] = (tipoCount[c.tipoEmpresa] || 0) + 1; });
  const barData = Object.entries(tipoCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const monthCount: Record<string, number> = {};
  interactions.forEach(i => {
    const month = i.date.slice(0, 7);
    monthCount[month] = (monthCount[month] || 0) + 1;
  });
  const lineData = Object.entries(monthCount).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({
    month: month.replace(/^(\d{4})-(\d{2})$/, "$2/$1"),
    value: count,
  }));

  const recentInteractions = [...interactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const upcomingActions = interactions
    .filter(i => i.proximaAcao)
    .sort((a, b) => (a.dataPrevista || "9999").localeCompare(b.dataPrevista || "9999"))
    .slice(0, 6);

  return (
    <motion.div className="p-6 space-y-6 max-w-[1600px]" variants={stagger} initial="hidden" animate="show">

      {/* Page header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground font-display">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Novo Cliente", path: "/clientes" },
            { label: "Nova Interação", path: "/historico" },
            { label: "Nova Venda", path: "/vendas" },
          ].map(btn => (
            <Button key={btn.label} size="sm" variant="outline"
              onClick={() => navigate(btn.path)}
              className="text-xs border-border/60 bg-white/[0.03] hover:bg-white/[0.06] gap-1.5">
              <Plus className="h-3 w-3" /> {btn.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Total" value={clients.length} icon={Users} index={0} />
        <KpiCard title="Ativos" value={ativos.length} icon={UserCheck} index={1} color="success" />
        <KpiCard title="Leads" value={leads.length} icon={UserPlus} index={2} color="info" />
        <KpiCard title="Prospects" value={prospects.length} icon={Eye} index={3} color="primary" />
        <KpiCard title="Sem Compras" value={semCompras.length} icon={AlertTriangle} index={4} color="danger" />
        <KpiCard title="Projetos" value={projetosAtivos} icon={Lightbulb} index={5} color="primary" />
      </motion.div>

      {/* Charts row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Interações por mês */}
        <div className="lg:col-span-2 card-surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground font-display">Interações por Mês</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Histórico de contatos realizados</p>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={lineData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38 92% 55%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(38 92% 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 12%)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "hsl(215 20% 40%)", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215 20% 40%)", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} width={25} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="value" name="Interações" stroke="hsl(38 92% 55%)" strokeWidth={2} fill="url(#colorValue)" dot={false} activeDot={{ r: 4, fill: "hsl(38 92% 55%)", stroke: "hsl(222 47% 7%)", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status pizza */}
        <div className="card-surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground font-display">Clientes por Status</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{clients.length} clientes total</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={58} strokeWidth={0} paddingAngle={3}>
                {pieData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#64748b"} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-semibold font-mono text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Tipo de empresa */}
        <div className="card-surface rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground font-display mb-5">Tipo de Empresa</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} layout="vertical" barSize={8}>
              <XAxis type="number" tick={{ fill: "hsl(215 20% 40%)", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fill: "hsl(215 20% 50%)", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" name="Clientes" fill="hsl(38 92% 55%)" radius={[0, 4, 4, 0]} background={{ fill: "hsl(222 47% 10%)", radius: 4 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Atividade recente */}
        <div className="card-surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground font-display">Atividade Recente</h3>
            <button onClick={() => navigate("/historico")} className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              Ver tudo <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentInteractions.map((i, idx) => {
              const Icon = typeIcons[i.type] || Mail;
              return (
                <motion.div key={i.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.04 }}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors group cursor-default"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-border/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-foreground truncate">{i.empresa}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{formatDate(i.date)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{i.summary}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Próximas ações */}
        <div className="card-surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground font-display">Próximas Ações</h3>
            <button onClick={() => navigate("/historico")} className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              Ver tudo <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {upcomingActions.map((i, idx) => {
              const isOverdue = i.dataPrevista && i.dataPrevista <= today;
              return (
                <motion.div key={i.id}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.04 }}
                  className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors cursor-default ${isOverdue ? "bg-red-400/5 border border-red-400/10 action-pulse" : "hover:bg-white/[0.03]"}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isOverdue ? "bg-red-400/10" : "bg-white/[0.04] border border-border/50"}`}>
                    <Clock className={`h-3 w-3 ${isOverdue ? "text-red-400" : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-foreground truncate">{i.empresa}</span>
                      {i.dataPrevista && (
                        <span className={`text-[10px] font-mono ${isOverdue ? "text-red-400 font-semibold" : "text-muted-foreground"}`}>
                          {formatDate(i.dataPrevista)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{i.proximaAcao}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

import { Users, UserCheck, UserPlus, Eye, AlertTriangle, Lightbulb, Plus, Mail, Phone, Handshake, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { KpiCard } from "@/components/KpiCard";
import { useClients } from "@/hooks/useClients";
import { useInteractions } from "@/hooks/useInteractions";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  "Ativo": "#FFC300",
  "Lead": "#3B82F6",
  "Prospect": "#F97316",
  "Inativo": "#9CA3AF",
  "Sem compras": "#EF4444",
};

const typeIcons: Record<string, typeof Mail> = {
  "E-mail": Mail,
  "WhatsApp": Phone,
  "Reunião": Handshake,
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
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
  const barData = Object.entries(tipoCount).map(([name, value]) => ({ name, value }));

  const monthCount: Record<string, number> = {};
  interactions.forEach(i => {
    const month = i.date.slice(0, 7);
    monthCount[month] = (monthCount[month] || 0) + 1;
  });
  const lineData = Object.entries(monthCount).sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({
    month: month.replace(/^(\d{4})-(\d{2})$/, "$2/$1"),
    interações: count,
  }));

  const recentInteractions = [...interactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const upcomingActions = interactions
    .filter(i => i.proximaAcao)
    .sort((a, b) => (a.dataPrevista || "9999").localeCompare(b.dataPrevista || "9999"))
    .slice(0, 8);

  const today = new Date().toISOString().slice(0, 10);

  const tooltipStyle = {
    backgroundColor: "hsla(0,0%,6%,0.85)",
    backdropFilter: "blur(40px)",
    border: "1px solid hsla(0,0%,100%,0.08)",
    borderRadius: "16px",
    fontFamily: "Inter",
    boxShadow: "0 8px 32px hsla(0,0%,0%,0.4)",
  };

  return (
    <motion.div className="p-6 space-y-6" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
            CRM Junior Pinheiro <span className="text-primary">|</span> Dashboard Gerencial
          </h1>
          <p className="text-xs font-display uppercase tracking-widest text-muted-foreground mt-1">
            Setor: Linha Autopeças — Linha Médio Pesado
          </p>
        </div>
        <motion.div className="flex gap-2 flex-wrap" variants={fadeUp}>
          {[
            { label: "Novo Cliente", path: "/clientes" },
            { label: "Nova Interação", path: "/historico" },
            { label: "Nova Venda", path: "/vendas" },
            { label: "Novo Projeto", path: "/projetos" },
          ].map(btn => (
            <Button key={btn.label} size="sm" onClick={() => navigate(btn.path)} className="text-xs font-display rounded-xl">
              <Plus className="h-3 w-3 mr-1" /> {btn.label}
            </Button>
          ))}
        </motion.div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Total Clientes" value={clients.length} icon={Users} index={0} />
        <KpiCard title="Ativos" value={ativos.length} icon={UserCheck} subtitle={ativos.map(c => c.empresa).join(", ")} index={1} />
        <KpiCard title="Leads" value={leads.length} icon={UserPlus} index={2} />
        <KpiCard title="Prospects" value={prospects.length} icon={Eye} index={3} />
        <KpiCard title="Sem Compras" value={semCompras.length} icon={AlertTriangle} index={4} />
        <KpiCard title="Projetos Ativos" value={projetosAtivos} icon={Lightbulb} index={5} />
      </div>

      {/* Charts */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Clientes por Status",
            content: (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} strokeWidth={0}>
                      {pieData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#666"} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] }} />
                      {d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </>
            ),
          },
          {
            title: "Tipo de Empresa",
            content: (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" tick={{ fill: "#999", fontSize: 11, fontFamily: "Inter" }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#999", fontSize: 10, fontFamily: "Inter" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="hsl(48 100% 50%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ),
          },
          {
            title: "Interações por Mês",
            content: (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#999", fontSize: 9, fontFamily: "Inter" }} />
                  <YAxis tick={{ fill: "#999", fontSize: 11, fontFamily: "Inter" }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="interações" stroke="hsl(48 100% 50%)" strokeWidth={2} dot={{ fill: "hsl(48 100% 50%)", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ),
          },
        ].map((chart, idx) => (
          <motion.div
            key={chart.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + idx * 0.1, ease: "easeOut" }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="glass glass-shimmer rounded-2xl p-5"
          >
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {chart.title}
            </h3>
            {chart.content}
          </motion.div>
        ))}
      </motion.div>

      {/* Activity & Actions */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Atividade Recente
          </h3>
          <div className="space-y-2">
            {recentInteractions.map((i, idx) => {
              const Icon = typeIcons[i.type] || Mail;
              return (
                <motion.div
                  key={i.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + idx * 0.04 }}
                  className="flex items-start gap-3 text-sm p-2.5 rounded-xl glass-interactive cursor-default"
                >
                  <div className="p-1.5 rounded-lg glass-subtle">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs text-muted-foreground">{formatDate(i.date)}</span>
                      <span className="font-medium text-foreground text-sm">{i.empresa}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{i.summary}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Próximas Ações
          </h3>
          <div className="space-y-2">
            {upcomingActions.map((i, idx) => {
              const isOverdue = i.dataPrevista && i.dataPrevista <= today;
              return (
                <motion.div
                  key={i.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + idx * 0.04 }}
                  className={`text-sm p-2.5 rounded-xl transition-colors ${isOverdue ? "border-l-2 border-l-destructive action-pulse glass-subtle bg-destructive/5" : "glass-interactive border-l-2 border-l-transparent"}`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-display text-xs text-muted-foreground">
                      {i.dataPrevista ? formatDate(i.dataPrevista) : "Pendente"}
                    </span>
                    <span className="font-medium text-foreground text-xs">{i.empresa}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{i.proximaAcao}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

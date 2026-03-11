import { Users, UserCheck, UserPlus, Eye, AlertTriangle, Lightbulb, Plus, Mail, Phone, Handshake, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { KpiCard } from "@/components/KpiCard";
import { clients } from "@/data/clients";
import { interactions } from "@/data/interactions";
import { projects } from "@/data/projects";
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Dashboard() {
  const navigate = useNavigate();
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

  const today = "2026-03-10";

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
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
            <Button key={btn.label} size="sm" onClick={() => navigate(btn.path)} className="text-xs font-display">
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
                    <Tooltip contentStyle={{ backgroundColor: "hsla(0,0%,7%,0.9)", backdropFilter: "blur(12px)", border: "1px solid hsla(0,0%,100%,0.08)", borderRadius: "12px", fontFamily: "Inter" }} />
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
                  <Tooltip contentStyle={{ backgroundColor: "hsla(0,0%,7%,0.9)", backdropFilter: "blur(12px)", border: "1px solid hsla(0,0%,100%,0.08)", borderRadius: "12px", fontFamily: "Inter" }} />
                  <Bar dataKey="value" fill="hsl(48 100% 50%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ),
          },
          {
            title: "Interações por Mês",
            content: (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: "#999", fontSize: 9, fontFamily: "Inter" }} />
                  <YAxis tick={{ fill: "#999", fontSize: 11, fontFamily: "Inter" }} />
                  <Tooltip contentStyle={{ backgroundColor: "hsla(0,0%,7%,0.9)", backdropFilter: "blur(12px)", border: "1px solid hsla(0,0%,100%,0.08)", borderRadius: "12px", fontFamily: "Inter" }} />
                  <Line type="monotone" dataKey="interações" stroke="hsl(48 100% 50%)" strokeWidth={2} dot={{ fill: "hsl(48 100% 50%)", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ),
          },
        ].map((chart, idx) => (
          <motion.div
            key={chart.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="glass rounded-xl p-4"
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
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-xl p-4"
        >
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Atividade Recente
          </h3>
          <div className="space-y-3">
            {recentInteractions.map((i, idx) => {
              const Icon = typeIcons[i.type] || Mail;
              return (
                <motion.div
                  key={i.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + idx * 0.05 }}
                  className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs text-muted-foreground">{formatDate(i.date)}</span>
                      <span className="font-medium text-foreground">{i.empresa}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{i.summary}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-xl p-4"
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
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + idx * 0.05 }}
                  className={`text-sm p-2 rounded-lg transition-colors ${isOverdue ? "border-l-2 border-l-destructive action-pulse bg-destructive/5" : "border-l-2 border-l-border hover:bg-secondary/20"}`}
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

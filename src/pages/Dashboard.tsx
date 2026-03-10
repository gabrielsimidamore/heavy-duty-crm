import { useState } from "react";
import { Users, UserCheck, UserPlus, Eye, AlertTriangle, Lightbulb, Plus, Mail, Phone, Handshake, Clock, TrendingUp } from "lucide-react";
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

  // Line chart: interactions per month
  const monthCount: Record<string, number> = {};
  interactions.forEach(i => {
    const month = i.date.slice(0, 7); // YYYY-MM
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
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
            CRM Junior Pinheiro <span className="text-primary">|</span> Dashboard Gerencial
          </h1>
          <p className="text-xs font-display uppercase tracking-widest text-muted-foreground mt-1">
            Setor: Linha Autopeças — Linha Médio Pesado
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => navigate("/clientes")} className="text-xs font-display">
            <Plus className="h-3 w-3 mr-1" /> Novo Cliente
          </Button>
          <Button size="sm" onClick={() => navigate("/historico")} className="text-xs font-display">
            <Plus className="h-3 w-3 mr-1" /> Nova Interação
          </Button>
          <Button size="sm" onClick={() => navigate("/vendas")} className="text-xs font-display">
            <Plus className="h-3 w-3 mr-1" /> Nova Venda
          </Button>
          <Button size="sm" onClick={() => navigate("/projetos")} className="text-xs font-display">
            <Plus className="h-3 w-3 mr-1" /> Novo Projeto
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Total Clientes" value={clients.length} icon={Users} />
        <KpiCard title="Ativos" value={ativos.length} icon={UserCheck} subtitle={ativos.map(c => c.empresa).join(", ")} />
        <KpiCard title="Leads" value={leads.length} icon={UserPlus} />
        <KpiCard title="Prospects" value={prospects.length} icon={Eye} />
        <KpiCard title="Sem Compras" value={semCompras.length} icon={AlertTriangle} />
        <KpiCard title="Projetos Ativos" value={projetosAtivos} icon={Lightbulb} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Clientes por Status
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} strokeWidth={0}>
                {pieData.map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#666"} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid hsl(0 0% 13%)", borderRadius: "8px", fontFamily: "Inter" }} />
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
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Tipo de Empresa
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" tick={{ fill: "#999", fontSize: 11, fontFamily: "Inter" }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#999", fontSize: 10, fontFamily: "Inter" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid hsl(0 0% 13%)", borderRadius: "8px", fontFamily: "Inter" }} />
              <Bar dataKey="value" fill="#FFD700" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Interações por Mês
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 13%)" />
              <XAxis dataKey="month" tick={{ fill: "#999", fontSize: 9, fontFamily: "Inter" }} />
              <YAxis tick={{ fill: "#999", fontSize: 11, fontFamily: "Inter" }} />
              <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid hsl(0 0% 13%)", borderRadius: "8px", fontFamily: "Inter" }} />
              <Line type="monotone" dataKey="interações" stroke="#FFD700" strokeWidth={2} dot={{ fill: "#FFD700", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Atividade Recente
          </h3>
          <div className="space-y-3">
            {recentInteractions.map(i => {
              const Icon = typeIcons[i.type] || Mail;
              return (
                <div key={i.id} className="flex items-start gap-3 text-sm">
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs text-muted-foreground">{formatDate(i.date)}</span>
                      <span className="font-medium text-foreground">{i.empresa}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{i.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Próximas Ações
          </h3>
          <div className="space-y-2">
            {upcomingActions.map(i => {
              const isOverdue = i.dataPrevista && i.dataPrevista <= today;
              return (
                <div
                  key={i.id}
                  className={`text-sm p-2 rounded-lg ${isOverdue ? "border-l-2 border-l-destructive action-pulse bg-destructive/5" : "border-l-2 border-l-border"}`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-display text-xs text-muted-foreground">
                      {i.dataPrevista ? formatDate(i.dataPrevista) : "Pendente"}
                    </span>
                    <span className="font-medium text-foreground text-xs">{i.empresa}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{i.proximaAcao}</p>
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
  return `${day}/${m}/${y}`;
}

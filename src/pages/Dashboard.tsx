import { Users, UserCheck, UserPlus, Eye, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { clients } from "@/data/clients";
import { interactions } from "@/data/interactions";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Mail, Phone, Handshake, Clock } from "lucide-react";

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
  const ativos = clients.filter(c => c.status === "Ativo");
  const leads = clients.filter(c => c.status === "Lead");
  const prospects = clients.filter(c => c.status === "Prospect");
  const semCompras = clients.filter(c => c.status === "Sem compras");

  const pieData = [
    { name: "Ativo", value: ativos.length },
    { name: "Lead", value: leads.length },
    { name: "Prospect", value: prospects.length },
    { name: "Inativo", value: clients.filter(c => c.status === "Inativo").length },
    { name: "Sem compras", value: semCompras.length },
  ].filter(d => d.value > 0);

  const tipoCount: Record<string, number> = {};
  clients.forEach(c => {
    tipoCount[c.tipoEmpresa] = (tipoCount[c.tipoEmpresa] || 0) + 1;
  });
  const barData = Object.entries(tipoCount).map(([name, value]) => ({ name, value }));

  const recentInteractions = [...interactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const upcomingActions = interactions
    .filter(i => i.proximaAcao)
    .sort((a, b) => (b.dataPrevista || b.date).localeCompare(a.dataPrevista || a.date))
    .slice(0, 6);

  const today = "2026-03-10";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          CRM Junior Pinheiro <span className="text-primary">|</span> Dashboard Gerencial
        </h1>
        <p className="text-xs font-display uppercase tracking-widest text-muted-foreground mt-1">
          Setor: Linha Autopeças — Linha Médio Pesado
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Total Clientes" value={clients.length} icon={Users} />
        <KpiCard title="Clientes Ativos" value={ativos.length} icon={UserCheck} subtitle={ativos.map(c => c.empresa).join(", ")} />
        <KpiCard title="Leads" value={leads.length} icon={UserPlus} subtitle={leads.map(c => c.empresa).join(", ")} />
        <KpiCard title="Prospects" value={prospects.length} icon={Eye} subtitle={prospects.map(c => c.empresa).join(", ")} />
        <KpiCard title="Sem Compras" value={semCompras.length} icon={AlertTriangle} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-sm p-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Distribuição por Status
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} strokeWidth={0}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#666"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "2px", fontFamily: "Inter" }}
                labelStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: STATUS_COLORS[d.name] }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Clientes por Tipo de Empresa
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" tick={{ fill: "#999", fontSize: 11, fontFamily: "Inter" }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#999", fontSize: 11, fontFamily: "Inter" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "2px", fontFamily: "Inter" }}
              />
              <Bar dataKey="value" fill="#FFD700" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-sm p-4">
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

        <div className="bg-card border border-border rounded-sm p-4">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Próximas Ações
          </h3>
          <div className="space-y-3">
            {upcomingActions.map(i => {
              const isOverdue = i.dataPrevista && i.dataPrevista <= today;
              return (
                <div
                  key={i.id}
                  className={`text-sm p-2 rounded-sm ${isOverdue ? "border-l-2 border-l-heat action-pulse" : "border-l-2 border-l-border"}`}
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

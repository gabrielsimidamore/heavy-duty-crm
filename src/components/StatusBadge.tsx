import { cn } from "@/lib/utils";
import type { ClientStatus } from "@/data/clients";

const statusConfig: Record<ClientStatus, { label: string; dot: string; badge: string }> = {
  "Ativo":       { label: "Ativo",       dot: "bg-emerald-400", badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  "Lead":        { label: "Lead",        dot: "bg-blue-400",    badge: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  "Prospect":    { label: "Prospect",    dot: "bg-amber-400",   badge: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  "Inativo":     { label: "Inativo",     dot: "bg-slate-500",   badge: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
  "Sem compras": { label: "Sem compras", dot: "bg-red-400",     badge: "text-red-400 bg-red-400/10 border-red-400/20" },
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  const cfg = statusConfig[status] ?? statusConfig["Inativo"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold border rounded-md font-display uppercase tracking-wider", cfg.badge)}>
      <span className={cn("status-dot", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

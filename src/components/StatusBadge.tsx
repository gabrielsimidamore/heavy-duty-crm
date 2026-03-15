import { cn } from "@/lib/utils";
import type { ClientStatus } from "@/data/clients";

const cfg: Record<ClientStatus, { dot: string; cls: string }> = {
  "Ativo":       { dot: "bg-emerald-500", cls: "badge-ativo" },
  "Lead":        { dot: "bg-blue-500",    cls: "badge-lead" },
  "Prospect":    { dot: "bg-amber-500",   cls: "badge-prospect" },
  "Inativo":     { dot: "bg-slate-400",   cls: "badge-inativo" },
  "Sem compras": { dot: "bg-red-500",     cls: "badge-sem" },
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  const s = cfg[status] ?? cfg["Inativo"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-[3px] text-[11px] font-semibold rounded", s.cls)}>
      <span className={cn("w-[5px] h-[5px] rounded-full shrink-0", s.dot)} />
      {status}
    </span>
  );
}

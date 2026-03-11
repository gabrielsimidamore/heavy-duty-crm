import { cn } from "@/lib/utils";
import type { ClientStatus } from "@/data/clients";

const statusStyles: Record<ClientStatus, string> = {
  "Ativo": "bg-status-ativo/10 text-status-ativo border-status-ativo/20",
  "Lead": "bg-status-lead/10 text-status-lead border-status-lead/20",
  "Prospect": "bg-status-prospect/10 text-status-prospect border-status-prospect/20",
  "Inativo": "bg-status-inativo/10 text-status-inativo border-status-inativo/20",
  "Sem compras": "bg-status-sem-compras/10 text-status-sem-compras border-status-sem-compras/20",
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 text-[10px] font-medium font-display uppercase tracking-wider border rounded-full backdrop-blur-sm",
      statusStyles[status]
    )}>
      {status}
    </span>
  );
}

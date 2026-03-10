import { cn } from "@/lib/utils";
import type { ClientStatus } from "@/data/clients";

const statusStyles: Record<ClientStatus, string> = {
  "Ativo": "bg-status-ativo/15 text-status-ativo border-status-ativo/30",
  "Lead": "bg-status-lead/15 text-status-lead border-status-lead/30",
  "Prospect": "bg-status-prospect/15 text-status-prospect border-status-prospect/30",
  "Inativo": "bg-status-inativo/15 text-status-inativo border-status-inativo/30",
  "Sem compras": "bg-status-sem-compras/15 text-status-sem-compras border-status-sem-compras/30",
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 text-xs font-medium font-display uppercase tracking-wider border rounded-sm",
      statusStyles[status]
    )}>
      {status}
    </span>
  );
}

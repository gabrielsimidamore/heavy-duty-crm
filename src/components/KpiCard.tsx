import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
}

export function KpiCard({ title, value, icon: Icon, subtitle }: KpiCardProps) {
  return (
    <div className="bg-card border border-border rounded-sm p-4 flex items-start gap-4">
      <div className="p-2 bg-primary/10 rounded-sm">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-display uppercase tracking-widest text-muted-foreground">{title}</p>
        <p className="text-2xl font-display font-bold text-foreground mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

import { LucideIcon, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  index?: number;
  trend?: number;
  color?: "default" | "primary" | "success" | "danger" | "info";
}

const colorMap = {
  default: { icon: "text-muted-foreground", bg: "bg-white/[0.04]", value: "text-foreground" },
  primary: { icon: "text-primary", bg: "bg-primary/10", value: "text-primary" },
  success: { icon: "text-emerald-400", bg: "bg-emerald-400/10", value: "text-emerald-400" },
  danger: { icon: "text-red-400", bg: "bg-red-400/10", value: "text-red-400" },
  info: { icon: "text-blue-400", bg: "bg-blue-400/10", value: "text-blue-400" },
};

export function KpiCard({ title, value, icon: Icon, subtitle, index = 0, trend, color = "default" }: KpiCardProps) {
  const colors = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
      className="card-surface card-hover rounded-xl p-4 group cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-lg", colors.bg)}>
          <Icon className={cn("h-4 w-4", colors.icon)} />
        </div>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded font-mono", trend >= 0 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10")}>
            <TrendingUp className={cn("h-2.5 w-2.5", trend < 0 && "rotate-180")} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <motion.p
          className={cn("text-2xl font-bold font-display leading-none", colors.value)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.06 + 0.15, type: "spring", stiffness: 200, damping: 20 }}
        >
          {value}
        </motion.p>
        <p className="text-[11px] text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">{title}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

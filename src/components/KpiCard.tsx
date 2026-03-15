import { LucideIcon, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  index?: number;
  trend?: string;
  color?: "default" | "blue" | "green" | "amber" | "red" | "purple";
}

const colors = {
  default: { icon: "text-muted-foreground", bg: "bg-accent",       val: "text-foreground" },
  blue:    { icon: "text-blue-600",         bg: "bg-blue-50",      val: "text-blue-700" },
  green:   { icon: "text-emerald-600",      bg: "bg-emerald-50",   val: "text-emerald-700" },
  amber:   { icon: "text-amber-600",        bg: "bg-amber-50",     val: "text-amber-700" },
  red:     { icon: "text-red-600",          bg: "bg-red-50",       val: "text-red-700" },
  purple:  { icon: "text-violet-600",       bg: "bg-violet-50",    val: "text-violet-700" },
};

export function KpiCard({ title, value, icon: Icon, subtitle, index = 0, trend, color = "default" }: KpiCardProps) {
  const c = colors[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="surface-card surface-card-hover rounded-lg p-4 cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", c.bg)}>
          <Icon className={cn("h-4 w-4", c.icon)} strokeWidth={1.75} />
        </div>
        {trend && (
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">{trend}</span>
        )}
      </div>
      <motion.p
        className={cn("text-[26px] font-bold leading-none tracking-tight", c.val)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 + 0.1 }}
      >
        {value}
      </motion.p>
      <p className="text-[11px] font-600 uppercase tracking-wide text-muted-foreground mt-2">{title}</p>
      {subtitle && <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">{subtitle}</p>}
    </motion.div>
  );
}

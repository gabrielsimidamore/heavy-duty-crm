import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
  index?: number;
}

export function KpiCard({ title, value, icon: Icon, subtitle, index = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      className="glass glass-glow rounded-xl p-4 flex items-start gap-4 group cursor-default"
    >
      <motion.div
        className="p-2.5 bg-primary/10 rounded-lg border border-primary/20"
        whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
      >
        <Icon className="h-5 w-5 text-primary transition-all duration-300 group-hover:drop-shadow-[0_0_8px_hsla(48,100%,50%,0.6)]" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-display uppercase tracking-widest text-muted-foreground">{title}</p>
        <motion.p
          className="text-2xl font-display font-bold text-foreground mt-1"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: index * 0.08 + 0.3, type: "spring", stiffness: 200 }}
        >
          {value}
        </motion.p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  index?: number;
  tone?: "default" | "positive" | "negative" | "warning";
  sub?: string;
}

const TONE_CLASS = {
  default: "text-foreground",
  positive: "text-primary-hover",
  negative: "text-danger",
  warning: "text-amber-600",
};

const ICON_BG = {
  default: "bg-muted text-muted-foreground",
  positive: "bg-primary-soft text-primary",
  negative: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-amber-500",
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  index = 0,
  tone = "default",
  sub,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Card className="p-5 hover:shadow-card-hover">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p
              className={cn(
                "mt-1.5 truncate text-2xl font-semibold tracking-tight tabular-nums",
                TONE_CLASS[tone],
              )}
            >
              {value}
            </p>
            {sub && <p className="mt-1 text-[11px] text-subtle">{sub}</p>}
          </div>
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              ICON_BG[tone],
            )}
          >
            <Icon className="size-4" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

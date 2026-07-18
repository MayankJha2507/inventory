import { motion } from "framer-motion";
import { Info, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  index?: number;
  tone?: "default" | "positive" | "negative" | "warning";
  sub?: string;
  /** Optional explanation shown in a tooltip behind an info icon. */
  info?: React.ReactNode;
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
  info,
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
            <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              {title}
              {info && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-full text-subtle/70 transition-colors hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      aria-label={`What does ${title} mean?`}
                    >
                      <Info className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px] leading-relaxed">
                    {info}
                  </TooltipContent>
                </Tooltip>
              )}
            </p>
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

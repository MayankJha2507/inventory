import { motion } from "framer-motion";
import { RANGES, type RangeKey } from "../useAnalyticsData";
import { cn } from "@/lib/utils";

interface RangePickerProps {
  value: RangeKey;
  onChange: (range: RangeKey) => void;
}

export function RangePicker({ value, onChange }: RangePickerProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl border border-border bg-surface p-1 shadow-sm">
      {RANGES.map((range) => (
        <button
          key={range.key}
          onClick={() => onChange(range.key)}
          className={cn(
            "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            value === range.key
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {value === range.key && (
            <motion.span
              layoutId="range-active"
              className="absolute inset-0 rounded-lg bg-muted"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
          <span className="relative z-10">{range.label}</span>
        </button>
      ))}
    </div>
  );
}

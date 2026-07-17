import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-danger-soft">
        <AlertTriangle className="size-5 text-danger" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCw /> Retry
        </Button>
      )}
    </div>
  );
}

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Right-side drawer built on Radix Dialog with framer-motion transitions.
 * Controlled: pass `open` and `onOpenChange`.
 */
interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sheet({
  open,
  onOpenChange,
  children,
  className,
  title,
  description,
  footer,
}: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                className={cn(
                  "fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col bg-surface shadow-drawer outline-none sm:inset-y-3 sm:right-3 sm:rounded-2xl",
                  className,
                )}
                initial={{ x: "calc(100% + 16px)" }}
                animate={{ x: 0 }}
                exit={{ x: "calc(100% + 16px)" }}
                transition={{ type: "spring", stiffness: 380, damping: 38 }}
              >
                <div className="flex items-start justify-between border-b border-border px-6 py-5">
                  <div className="min-w-0">
                    <DialogPrimitive.Title className="truncate text-base font-semibold">
                      {title}
                    </DialogPrimitive.Title>
                    {description ? (
                      <DialogPrimitive.Description className="mt-0.5 text-xs text-muted-foreground">
                        {description}
                      </DialogPrimitive.Description>
                    ) : (
                      <DialogPrimitive.Description className="sr-only">
                        Details panel
                      </DialogPrimitive.Description>
                    )}
                  </div>
                  <DialogPrimitive.Close className="ml-4 shrink-0 rounded-lg p-1.5 text-subtle transition-colors hover:bg-muted hover:text-foreground focus:outline-none">
                    <X className="size-4" />
                  </DialogPrimitive.Close>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
                {footer && (
                  <div className="border-t border-border px-6 py-4">{footer}</div>
                )}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

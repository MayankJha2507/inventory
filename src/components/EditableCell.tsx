import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string | number;
  type?: "text" | "number";
  /** Called with the parsed value when the edit is committed. */
  onSave: (value: string | number) => void;
  /** Optional display formatter (e.g. currency). */
  display?: (value: string | number) => string;
  align?: "left" | "right";
  min?: number;
  step?: number | "any";
  placeholder?: string;
  className?: string;
}

/**
 * Airtable-style inline editable cell: click to edit, Enter/blur to autosave,
 * Escape to cancel.
 */
export function EditableCell({
  value,
  type = "text",
  onSave,
  display,
  align = "left",
  min = 0,
  step = "any",
  placeholder,
  className,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    if (editing) {
      setDraft(String(value));
      cancelled.current = false;
      requestAnimationFrame(() => inputRef.current?.select());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (cancelled.current) return;
    if (type === "number") {
      const parsed = Number(draft);
      if (Number.isNaN(parsed) || parsed < min) return;
      if (parsed !== value) onSave(parsed);
    } else {
      const trimmed = draft.trim();
      if (trimmed !== "" && trimmed !== value) onSave(trimmed);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={draft}
        min={min}
        step={step}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            cancelled.current = true;
            setEditing(false);
          }
          e.stopPropagation();
        }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "h-7 w-full min-w-0 rounded-lg border border-primary/50 bg-surface px-2 text-sm outline-none ring-2 ring-ring/25",
          align === "right" && "text-right",
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      className={cn(
        "block h-7 w-full cursor-text truncate rounded-lg px-2 text-left text-sm leading-7 transition-colors hover:bg-muted/80 hover:ring-1 hover:ring-border",
        align === "right" && "text-right",
        !String(value) && "text-subtle",
        className,
      )}
      title="Click to edit"
    >
      {display ? display(value) : String(value) || placeholder || "—"}
    </button>
  );
}

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PublicationStatus } from "@/lib/schemas";

export const STATUS_LABELS: Record<PublicationStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

export function StatusBadge({ status }: { status: PublicationStatus }) {
  return (
    <span className="ml-1 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {STATUS_LABELS[status]}
    </span>
  );
}

function FieldShell({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const describe = (id: string, hint?: string, error?: string) => ({
  ...(error ? { "aria-invalid": true, "aria-describedby": `${id}-err` } : {}),
  ...(!error && hint ? { "aria-describedby": `${id}-hint` } : {}),
});

type FieldProps = {
  prefix: string;
  name: string;
  label: string;
  value: string | number;
  errors: Record<string, string>;
  hint?: string;
  maxLength?: number;
};

export function TextField({
  prefix,
  name,
  label,
  value,
  errors,
  hint,
  maxLength,
  ...rest
}: FieldProps & { type?: string; inputMode?: "numeric" | "tel" | "url"; placeholder?: string }) {
  const id = `${prefix}-${name}`;
  return (
    <FieldShell id={id} label={label} hint={hint} error={errors[name]}>
      <Input
        id={id}
        name={name}
        defaultValue={value}
        {...(maxLength ? { maxLength } : {})}
        {...rest}
        {...describe(id, hint, errors[name])}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  prefix,
  name,
  label,
  value,
  errors,
  hint,
  maxLength,
  rows = 3,
}: FieldProps & { rows?: number }) {
  const id = `${prefix}-${name}`;
  return (
    <FieldShell id={id} label={label} hint={hint} error={errors[name]}>
      <Textarea
        id={id}
        name={name}
        defaultValue={value}
        rows={rows}
        {...(maxLength ? { maxLength } : {})}
        {...describe(id, hint, errors[name])}
      />
    </FieldShell>
  );
}

export function SelectField({
  prefix,
  name,
  label,
  value,
  errors,
  hint,
  options,
}: FieldProps & { options: [string, string][] }) {
  const id = `${prefix}-${name}`;
  return (
    <FieldShell id={id} label={label} hint={hint} error={errors[name]}>
      <select
        id={id}
        name={name}
        defaultValue={value}
        className={selectClass}
        {...describe(id, hint, errors[name])}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS) as [string, string][];

export function zodErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const next: Record<string, string> = {};
  issues.forEach((issue) => (next[String(issue.path[0])] ??= issue.message));
  return next;
}

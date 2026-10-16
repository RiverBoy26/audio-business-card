import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  label: string
}

export function Field({ className, error, id, label, ...props }: FieldProps) {
  const errorId = id ? `${id}-error` : undefined

  return (
    <label className="grid gap-1.5 text-xs font-medium" htmlFor={id}>
      {label}
      <input
        {...props}
        aria-describedby={error ? errorId : props['aria-describedby']}
        aria-invalid={error ? true : props['aria-invalid']}
        className={cn(
          'h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/15',
          className,
        )}
        id={id}
      />
      {error ? <span className="text-xs font-normal text-destructive" id={errorId}>{error}</span> : null}
    </label>
  )
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
}

export function SelectField({
  children,
  className,
  id,
  label,
  ...props
}: SelectFieldProps) {
  return (
    <label className="grid gap-1.5 text-xs font-medium" htmlFor={id}>
      {label}
      <select
        className={cn(
          'h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted',
          className,
        )}
        id={id}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

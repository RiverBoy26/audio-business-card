import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export function Field({ className, id, label, ...props }: FieldProps) {
  return (
    <label className="grid gap-1.5 text-xs font-medium" htmlFor={id}>
      {label}
      <input
        className={cn(
          'h-10 w-full rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
          className,
        )}
        id={id}
        {...props}
      />
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

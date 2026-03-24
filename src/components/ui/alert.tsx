import { cn } from '@/lib/utils'

export function Alert({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('rounded-xl border border-border bg-card p-4 text-sm', className)} {...props} />
}

export function AlertTitle({ className, ...props }: React.ComponentProps<'h5'>) {
  return <h5 className={cn('font-semibold text-foreground', className)} {...props} />
}

export function AlertDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('mt-1 text-muted-foreground', className)} {...props} />
}

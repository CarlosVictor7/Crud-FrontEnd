import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', {
  variants: {
    variant: {
      default: 'border-primary/30 bg-primary/15 text-primary',
      neutral: 'border-border bg-muted text-muted-foreground',
      success: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-500',
      warning: 'border-amber-500/30 bg-amber-500/15 text-amber-500',
      destructive: 'border-destructive/30 bg-destructive/15 text-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

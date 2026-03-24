import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KpiCardProps {
  label: string
  value: number
  helper: string
}

export function KpiCard({ label, value, helper }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-3xl font-semibold tracking-tight text-foreground'>{value}</p>
        <p className='mt-1 text-xs text-muted-foreground'>{helper}</p>
      </CardContent>
    </Card>
  )
}

import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts'

interface InventoryDatum {
  name: string
  stock: number
}

interface InventoryChartProps {
  data: InventoryDatum[]
}

export function InventoryChart({ data }: InventoryChartProps) {
  return (
    <div className='h-[280px] w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <defs>
            <linearGradient id='stockGradient' x1='0' x2='0' y1='0' y2='1'>
              <stop offset='0%' stopColor='var(--color-primary)' stopOpacity={0.7} />
              <stop offset='100%' stopColor='var(--color-primary)' stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke='var(--color-border)' strokeDasharray='3 3' />
          <XAxis dataKey='name' stroke='var(--color-muted-foreground)' />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-popover)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
            }}
            labelStyle={{ color: 'var(--color-foreground)' }}
          />
          <Area type='monotone' dataKey='stock' stroke='var(--color-primary)' fill='url(#stockGradient)' strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

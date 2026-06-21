import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { CandlePoint } from '../../types/domain'
import { formatCurrency } from '../../lib/utils/format'

interface Props {
  data: CandlePoint[]
}

export function StockLineChart({ data }: Props) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
      No chart data available
    </div>
  )

  const first = data[0].close
  const last = data[data.length - 1].close
  const color = last >= first ? '#2bd9a0' : '#ff6b7a'
  const gradientId = `area-${last >= first ? 'up' : 'down'}`

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1b2538" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#677488', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fill: '#677488', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          width={60}
        />
        <Tooltip
          contentStyle={{ background: '#1c2738', border: '1px solid #2a3650', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
          labelStyle={{ color: '#a3b0c2' }}
          itemStyle={{ color: color }}
          formatter={(v: number) => [formatCurrency(v), 'Price']}
        />
        <ReferenceLine y={first} stroke="#3a4762" strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

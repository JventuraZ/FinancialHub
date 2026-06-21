import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { CandlePoint } from '../../types/domain'
import { formatCurrency } from '../../lib/utils/format'

interface Props {
  data: CandlePoint[]
}

interface ShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: CandlePoint & { isUp: boolean }
}

function CandleShape({ x = 0, y = 0, width = 0, height = 0, payload }: ShapeProps) {
  if (!payload || height <= 0) return null
  const { open, high, low, close, isUp } = payload
  const range = high - low
  if (range === 0) return null

  const fill = isUp ? '#2bd9a0' : '#ff6b7a'

  // y = pixel for high (top), y+height = pixel for low (bottom)
  const openY  = y + ((high - open)  / range) * height
  const closeY = y + ((high - close) / range) * height
  const bodyTop    = Math.min(openY, closeY)
  const bodyHeight = Math.max(Math.abs(openY - closeY), 1)
  const cx = x + width / 2

  return (
    <g>
      {/* Wick */}
      <line x1={cx} y1={y} x2={cx} y2={y + height} stroke={fill} strokeWidth={1} />
      {/* Body */}
      <rect
        x={x + 1}
        y={bodyTop}
        width={Math.max(width - 2, 2)}
        height={bodyHeight}
        fill={fill}
      />
    </g>
  )
}

export function CandlestickChart({ data }: Props) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
      No chart data available
    </div>
  )

  const chartData = data.map((d) => ({
    ...d,
    ohlc: [d.low, d.high] as [number, number],
    isUp: d.close >= d.open,
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
          contentStyle={{ background: '#1c2738', border: '1px solid #2a3650', borderRadius: 8 }}
          labelStyle={{ color: '#a3b0c2' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload as CandlePoint & { isUp: boolean }
            return (
              <div className="bg-surface-elevated border border-surface-border rounded-lg p-3 text-xs space-y-1 shadow-card">
                <p className="text-slate-400 mb-2">{d.date}</p>
                <p className="text-slate-300">O: <span className="text-slate-100">{formatCurrency(d.open)}</span></p>
                <p className="text-slate-300">H: <span className="text-pos">{formatCurrency(d.high)}</span></p>
                <p className="text-slate-300">L: <span className="text-neg">{formatCurrency(d.low)}</span></p>
                <p className="text-slate-300">C: <span className={d.isUp ? 'text-pos' : 'text-neg'}>{formatCurrency(d.close)}</span></p>
              </div>
            )
          }}
        />
        <Bar
          dataKey="ohlc"
          shape={(props: ShapeProps) => <CandleShape {...props} />}
          barSize={8}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

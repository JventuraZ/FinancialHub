import { BarChart2, TrendingUp } from 'lucide-react'
import type { ChartType } from '../../types/domain'

interface Props {
  value: ChartType
  onChange: (ct: ChartType) => void
}

export function ChartTypeSwitcher({ value, onChange }: Props) {
  return (
    <div className="flex bg-surface-elevated border border-surface-border/60 rounded-lg p-1 gap-1">
      {([
        { type: 'line' as ChartType, label: 'Line', Icon: TrendingUp },
        { type: 'candlestick' as ChartType, label: 'OHLC', Icon: BarChart2 },
      ]).map(({ type, label, Icon }) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            value === type
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  )
}

import type { Timeframe } from '../../types/domain'

const FRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y']

interface Props {
  value: Timeframe
  onChange: (tf: Timeframe) => void
}

export function TimeframeSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {FRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
            value === tf
              ? 'bg-brand-600 text-white shadow-glow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  )
}

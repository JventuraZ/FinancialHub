import type { FinnhubNewsItem } from '../../types/finnhub'

interface Props {
  items: FinnhubNewsItem[]
}

export function NewsTicker({ items }: Props) {
  if (!items.length) return null
  const text = items.slice(0, 6).map((i) => i.headline).join('   •   ')
  return (
    <div className="bg-brand-900/40 border border-brand-800/50 rounded-lg overflow-hidden h-9 flex items-center">
      <span className="bg-brand-600 text-white text-xs font-bold px-3 h-full flex items-center shrink-0">
        LIVE
      </span>
      <div className="overflow-hidden flex-1 relative">
        <p className="whitespace-nowrap text-sm text-brand-300 animate-ticker inline-block">
          {text}
        </p>
      </div>
    </div>
  )
}

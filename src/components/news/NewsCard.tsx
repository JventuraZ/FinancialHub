import { ExternalLink } from 'lucide-react'
import type { FinnhubNewsItem } from '../../types/finnhub'
import { toDateString } from '../../lib/utils/date'
import { sanitizeUrl, sanitizeImageUrl } from '../../lib/utils/sanitizeUrl'

interface Props {
  item: FinnhubNewsItem
  compact?: boolean
}

export function NewsCard({ item, compact = false }: Props) {
  const safeUrl = sanitizeUrl(item.url)

  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 bg-surface-card border border-surface-border rounded-xl p-3 shadow-card hover:border-brand-600 hover:shadow-glow-sm transition-all group"
    >
      {!compact && sanitizeImageUrl(item.image) && (
        <img
          src={sanitizeImageUrl(item.image)!}
          alt=""
          className="w-20 h-16 object-cover rounded-lg shrink-0 bg-surface"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-200 group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
            {item.headline}
          </p>
          <ExternalLink size={12} className="text-slate-600 group-hover:text-brand-400 shrink-0 mt-0.5" />
        </div>
        {!compact && item.summary && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.summary}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
          <span className="font-medium text-slate-400">{item.source}</span>
          <span>·</span>
          <span>{toDateString(item.datetime)}</span>
        </div>
      </div>
    </a>
  )
}

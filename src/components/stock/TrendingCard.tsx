import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useQuote } from '../../hooks/finnhub/useQuote'
import { useCompanyProfile } from '../../hooks/finnhub/useCompanyProfile'
import { formatCurrency, formatPercent } from '../../lib/utils/format'
import { Skeleton } from '../ui/Skeleton'

interface Props {
  symbol: string
}

export function TrendingCard({ symbol }: Props) {
  const { data: quote, isLoading } = useQuote(symbol)
  const { data: profile } = useCompanyProfile(symbol)

  if (isLoading) return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-card">
      <Skeleton className="h-4 w-12 mb-2" />
      <Skeleton className="h-6 w-24 mb-2" />
      <Skeleton className="h-4 w-16" />
    </div>
  )

  if (!quote) return null

  const isPositive = quote.dp >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <Link
      to={`/stocks/${symbol}`}
      className="bg-surface-card border border-surface-border rounded-xl p-4 shadow-card hover:border-brand-600 hover:shadow-glow-sm hover:-translate-y-0.5 transition-all block"
    >
      <div className="flex items-center justify-between mb-2">
        {profile?.logo ? (
          <img src={profile.logo} alt={symbol} className="h-6 w-6 rounded object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <span className="text-xs font-bold text-slate-400">{symbol}</span>
        )}
        <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-pos' : 'text-neg'}`}>
          <Icon size={12} />
          {formatPercent(quote.dp)}
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-1 truncate">{profile?.name ?? symbol}</p>
      <p className="text-lg font-bold text-slate-100">{formatCurrency(quote.c)}</p>
    </Link>
  )
}

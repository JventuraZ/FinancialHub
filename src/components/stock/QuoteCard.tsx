import { TrendingUp, TrendingDown } from 'lucide-react'
import { useQuote } from '../../hooks/finnhub/useQuote'
import { formatCurrency, formatPercent } from '../../lib/utils/format'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { ErrorMessage } from '../ui/ErrorMessage'

interface Props {
  symbol: string
}

export function QuoteCard({ symbol }: Props) {
  const { data, isLoading, isError } = useQuote(symbol)

  if (isLoading) {
    return (
      <Card>
        <Skeleton className="h-8 w-32 mb-3" />
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-4 w-48" />
      </Card>
    )
  }
  if (isError || !data) return <Card><ErrorMessage /></Card>

  const isPositive = data.d >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{symbol}</p>
          <p className="text-3xl font-bold text-slate-100">{formatCurrency(data.c)}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${
          isPositive ? 'bg-pos-soft text-pos border-pos/30' : 'bg-neg-soft text-neg border-neg/30'
        }`}>
          <TrendIcon size={14} />
          {formatPercent(data.dp)}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {[
          { label: 'Change', value: (data.d >= 0 ? '+' : '') + data.d.toFixed(2) },
          { label: 'Open', value: formatCurrency(data.o) },
          { label: 'High', value: formatCurrency(data.h) },
          { label: 'Low', value: formatCurrency(data.l) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface border border-surface-border/60 rounded-lg p-2.5">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-sm font-medium text-slate-200">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

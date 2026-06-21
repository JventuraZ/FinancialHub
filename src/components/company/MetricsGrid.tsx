import { useMetrics } from '../../hooks/finnhub/useMetrics'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { ErrorMessage } from '../ui/ErrorMessage'
import { EmptyState } from '../ui/EmptyState'

interface Props {
  symbol: string
}

export function MetricsGrid({ symbol }: Props) {
  const { data, isLoading, isError } = useMetrics(symbol)

  if (isLoading) return (
    <Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-surface border border-surface-border/60 rounded-lg p-3">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </Card>
  )
  if (isError) return <Card><ErrorMessage /></Card>
  if (!data?.length) return <Card><EmptyState title="No metrics available" /></Card>

  return (
    <Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.map(({ label, value }) => (
          <div key={label} className="bg-surface rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-sm font-semibold text-slate-200">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

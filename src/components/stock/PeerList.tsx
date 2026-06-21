import { Link } from 'react-router-dom'
import { usePeers } from '../../hooks/finnhub/usePeers'
import { Skeleton } from '../ui/Skeleton'

interface Props {
  symbol: string
}

export function PeerList({ symbol }: Props) {
  const { data: peers, isLoading } = usePeers(symbol)

  if (isLoading) return (
    <div className="flex gap-2">
      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-16" />)}
    </div>
  )

  if (!peers?.length) return null

  return (
    <div className="flex gap-2 flex-wrap">
      {peers.filter((p) => p !== symbol).slice(0, 8).map((peer) => (
        <Link
          key={peer}
          to={`/company/${peer}`}
          className="px-3 py-1.5 bg-surface-elevated border border-surface-border rounded-lg text-xs font-semibold text-slate-300 hover:border-brand-500 hover:text-brand-300 hover:shadow-glow-sm transition-all"
        >
          {peer}
        </Link>
      ))}
    </div>
  )
}

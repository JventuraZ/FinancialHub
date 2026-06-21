import { ExternalLink, Building2 } from 'lucide-react'
import { useCompanyProfile } from '../../hooks/finnhub/useCompanyProfile'
import { formatLargeNumber } from '../../lib/utils/format'
import { sanitizeImageUrl } from '../../lib/utils/sanitizeUrl'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Skeleton } from '../ui/Skeleton'
import { ErrorMessage } from '../ui/ErrorMessage'

interface Props {
  symbol: string
}

export function ProfileHeader({ symbol }: Props) {
  const { data, isLoading, isError } = useCompanyProfile(symbol)

  if (isLoading) return (
    <Card className="flex gap-4">
      <Skeleton className="h-16 w-16 rounded-xl" />
      <div className="flex-1">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-4 w-64" />
      </div>
    </Card>
  )
  if (isError || !data) return <Card><ErrorMessage /></Card>

  const safeLogo = sanitizeImageUrl(data.logo)
  const safeWebUrl = sanitizeImageUrl(data.weburl)

  return (
    <Card className="flex items-start gap-4">
      <div className="shrink-0 w-16 h-16 bg-surface rounded-xl flex items-center justify-center overflow-hidden border border-surface-border">
        {safeLogo
          ? <img src={safeLogo} alt={data.name} className="w-full h-full object-contain p-1" />
          : <Building2 size={28} className="text-slate-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h1 className="text-xl font-bold text-slate-100">{data.name}</h1>
          <Badge variant="blue">{data.ticker}</Badge>
          <Badge variant="gray">{data.exchange}</Badge>
        </div>
        <p className="text-sm text-slate-400 mb-3">{data.finnhubIndustry} · {data.country}</p>
        <div className="flex items-center gap-4 flex-wrap text-sm">
          <span className="text-slate-400">Market Cap: <span className="text-slate-200 font-medium">${formatLargeNumber(data.marketCapitalization)}M</span></span>
          {data.ipo && <span className="text-slate-400">IPO: <span className="text-slate-200 font-medium">{data.ipo}</span></span>}
          {safeWebUrl && (
            <a href={safeWebUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors">
              <ExternalLink size={12} />
              Website
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}

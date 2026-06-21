import { useCompanyNews } from '../../hooks/finnhub/useCompanyNews'
import { isoDateDaysAgo } from '../../lib/utils/date'
import { NewsCard } from '../news/NewsCard'
import { Spinner } from '../ui/Spinner'
import { ErrorMessage } from '../ui/ErrorMessage'
import { EmptyState } from '../ui/EmptyState'

interface Props {
  symbol: string
}

export function CompanyNewsFeed({ symbol }: Props) {
  const from = isoDateDaysAgo(30)
  const to = isoDateDaysAgo(0)
  const { data, isLoading, isError } = useCompanyNews(symbol, from, to)

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>
  if (isError) return <ErrorMessage />
  if (!data?.length) return <EmptyState title="No recent news" description="No company news found for the past 30 days." />

  return (
    <div className="space-y-3">
      {data.slice(0, 15).map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
    </div>
  )
}

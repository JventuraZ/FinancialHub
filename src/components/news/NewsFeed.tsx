import type { FinnhubNewsItem } from '../../types/finnhub'
import { NewsCard } from './NewsCard'

interface Props {
  items: FinnhubNewsItem[]
}

export function NewsFeed({ items }: Props) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
    </div>
  )
}

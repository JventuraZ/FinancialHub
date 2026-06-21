import { useState } from 'react'
import { Newspaper } from 'lucide-react'
import { useMarketNews } from '../hooks/finnhub/useMarketNews'
import { CategoryFilter } from '../components/news/CategoryFilter'
import { NewsFeed } from '../components/news/NewsFeed'
import { PageContainer } from '../components/layout/PageContainer'
import { Spinner } from '../components/ui/Spinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { EmptyState } from '../components/ui/EmptyState'
import type { NewsCategory } from '../types/domain'

export function NewsPage() {
  const [category, setCategory] = useState<NewsCategory>('general')
  const { data, isLoading, isError } = useMarketNews(category)

  return (
    <PageContainer>
      <div className="flex items-center gap-2 mb-4">
        <Newspaper size={20} className="text-brand-400" />
        <h1 className="text-2xl font-bold text-slate-100">Market News</h1>
      </div>

      <div className="mb-5">
        <CategoryFilter active={category} onChange={setCategory} />
      </div>

      {isLoading && <div className="flex justify-center py-12"><Spinner size={32} /></div>}
      {isError && <ErrorMessage message="Failed to load news. Check your API key." />}
      {data && data.length === 0 && <EmptyState title="No news found" />}
      {data && data.length > 0 && <NewsFeed items={data} />}
    </PageContainer>
  )
}

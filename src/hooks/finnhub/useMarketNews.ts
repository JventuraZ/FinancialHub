import { useQuery } from '@tanstack/react-query'
import { fetchMarketNews } from '../../lib/finnhub/endpoints'
import { FINNHUB_KEYS } from './queryKeys'
import type { NewsCategory } from '../../types/domain'

export function useMarketNews(category: NewsCategory = 'general') {
  return useQuery({
    queryKey: FINNHUB_KEYS.marketNews(category),
    queryFn: () => fetchMarketNews(category),
  })
}
